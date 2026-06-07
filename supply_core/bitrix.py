"""Bitrix24 sp178 (smart process) — мост Муравья: заявки → CRM.

Вебхук — СЕКРЕТ. Берётся из env BITRIX_WEBHOOK или supply_core/.env (gitignored).
Целиком в лог/чат не печатаем (только маска), в репо не коммитим.

БЕЗОПАСНОСТЬ (пишем в боевую CRM):
- по умолчанию live=False → запись НЕ идёт (в т.ч. при сидинге/демо — никаких
  случайных заявок в боевом Bitrix);
- crm.item.add/delete выполняются ТОЛЬКО при явном live=True (CLI/endpoint),
  после probe схемы и подтверждения;
- crm.item.fields / list / get — read-only, безопасны при наличии вебхука.

API smart-process: параметры в JSON-теле; кастомные поля — camelCase ufCrm...,
их точные коды СНАЧАЛА узнаём через crm.item.fields (portal-specific), НЕ угадываем.
CLI:  python3 -m supply_core.bitrix probe          # read-only: схема + последние items
      python3 -m supply_core.bitrix push-test --live  # 1 помеченная тест-заявка
      python3 -m supply_core.bitrix list
      python3 -m supply_core.bitrix delete <id> --live
"""
import json
import os
import ssl
import time
import urllib.error
import urllib.request

_ENV_LOADED = False


def _load_env():
    """Минимальный .env-загрузчик (без зависимостей). Файл gitignored."""
    global _ENV_LOADED
    if _ENV_LOADED:
        return
    _ENV_LOADED = True
    path = os.path.join(os.path.dirname(__file__), ".env")
    if not os.path.exists(path):
        return
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


class BitrixError(Exception):
    pass


class Bitrix:
    def __init__(self, webhook=None, live=False, dry_run=None,
                 entity_type_id=None, timeout=20):
        _load_env()
        self.webhook = (webhook or os.environ.get("BITRIX_WEBHOOK") or "").strip().rstrip("/")
        self.entity = int(entity_type_id or os.environ.get("BITRIX_SP", "178"))
        self.timeout = timeout
        if dry_run is True:        # обратная совместимость со старым вызовом
            live = False
        # live только при наличии вебхука и явном намерении; без вебхука всегда dry
        self.live = bool(live and self.webhook)

    @property
    def dry_run(self):             # совместимость со старым кодом
        return not self.live

    @property
    def portal(self):
        return self.webhook.split("/rest/")[0] if "/rest/" in self.webhook else ""

    def masked(self):
        if not self.webhook:
            return "(нет вебхука — DRY-RUN)"
        return f"{self.portal}/rest/****  [{'LIVE' if self.live else 'вебхук есть, режим DRY'}]"

    # ——— низкоуровневый REST-вызов (2 канала ошибок + ретрай на лимит) ———
    def call(self, method, params=None, raw=False, _retries=3):
        if not self.webhook:
            raise BitrixError("нет BITRIX_WEBHOOK — положи в supply_core/.env")
        url = f"{self.webhook}/{method}.json"
        data = json.dumps(params or {}).encode("utf-8")
        delay = 1.0
        for attempt in range(_retries + 1):
            try:
                req = urllib.request.Request(
                    url, data=data, headers={"Content-Type": "application/json"})
                with urllib.request.urlopen(
                        req, timeout=self.timeout,
                        context=ssl.create_default_context()) as resp:
                    body = json.loads(resp.read().decode("utf-8"))
            except urllib.error.HTTPError as e:
                try:
                    body = json.loads(e.read().decode("utf-8") or "{}")
                except Exception:
                    body = {}
                code = body.get("error", "")
                if (e.code == 503 or code == "QUERY_LIMIT_EXCEEDED") and attempt < _retries:
                    time.sleep(delay); delay *= 2; continue
                raise BitrixError(f"{method}: HTTP {e.code} {code}: {body.get('error_description', '')}")
            except urllib.error.URLError as e:
                if attempt < _retries:
                    time.sleep(delay); delay *= 2; continue
                raise BitrixError(f"{method}: сеть/URL — {e.reason}")
            # канал ошибок в теле: success={result,time}, fail={error,error_description}
            if isinstance(body, dict) and body.get("error"):
                if body["error"] == "QUERY_LIMIT_EXCEEDED" and attempt < _retries:
                    time.sleep(delay); delay *= 2; continue
                raise BitrixError(f"{method}: {body['error']}: {body.get('error_description', '')}")
            if raw:
                return body
            return body.get("result", body) if isinstance(body, dict) else body

    # ——— read-only (безопасно при наличии вебхука) ———
    def fields(self):
        res = self.call("crm.item.fields",
                        {"entityTypeId": self.entity, "useOriginalUfNames": "N"})
        return res.get("fields", res) if isinstance(res, dict) else {}

    def required_fields(self):
        """Поля, ОБЯЗАТЕЛЬНЫЕ на add (isRequired и не read-only) — без них add падает."""
        return {c: m for c, m in self.fields().items()
                if m.get("isRequired") and not m.get("isReadOnly")}

    def list_items(self, select=None, filt=None, order=None, start=0):
        p = {"entityTypeId": self.entity, "start": start}
        if select:
            p["select"] = select
        if filt:
            p["filter"] = filt
        if order:
            p["order"] = order
        res = self.call("crm.item.list", p)              # result.items (стр. 50)
        return res.get("items", []) if isinstance(res, dict) else []

    def list_all(self, select=None, filt=None):
        """Все items через ID-курсор (start=-1, без COUNT) — для массовых чтений."""
        out, last = [], 0
        while True:
            f = dict(filt or {}); f[">id"] = last
            body = self.call("crm.item.list", {
                "entityTypeId": self.entity, "select": select or ["id", "title"],
                "filter": f, "order": {"id": "ASC"}, "start": -1}, raw=True)
            items = (body.get("result") or {}).get("items", [])
            out.extend(items)
            if len(items) < 50:
                return out
            last = items[-1]["id"]

    def get_item(self, item_id):
        res = self.call("crm.item.get", {"entityTypeId": self.entity,
                                         "id": int(item_id), "useOriginalUfNames": "N"})
        return res.get("item", res) if isinstance(res, dict) else {}

    def types(self):
        """crm.type.list → smart-процессы портала (проверка entityTypeId перед записью)."""
        res = self.call("crm.type.list")
        return res.get("types", []) if isinstance(res, dict) else []

    # ——— запись (ТОЛЬКО live) ———
    def add_item(self, fields):
        if not self.live:
            print("    [bitrix DRY] crm.item.add ← " + json.dumps(fields, ensure_ascii=False))
            return {"id": "DRY-%05d" % (abs(hash(json.dumps(fields, ensure_ascii=False, sort_keys=True))) % 100000),
                    "title": fields.get("title")}
        res = self.call("crm.item.add", {"entityTypeId": self.entity,
                                         "fields": fields, "useOriginalUfNames": "N"})
        return res.get("item", res) if isinstance(res, dict) else {}

    def delete_item(self, item_id):
        if not self.live:
            print(f"    [bitrix DRY] crm.item.delete id={item_id}")
            return True
        self.call("crm.item.delete", {"entityTypeId": self.entity, "id": int(item_id)})
        return True  # успех = пустой result []; call() поднимет BitrixError при ошибке

    def verify_written(self, item_id, sent_fields):
        """Гард от «тихого игнора»: какие отправленные поля НЕ записались (None/пусто)."""
        item = self.get_item(item_id)
        return [k for k in sent_fields if k != "title" and not item.get(k)]

    def item_url(self, item_id):
        return f"{self.portal}/crm/type/{self.entity}/details/{item_id}/" if self.portal else ""

    # ——— заявка → sp178 ———
    @staticmethod
    def request_title(req: dict, test=False) -> str:
        # вся ключевая инфа в заголовке — видна в канбане sp178 без кастомных полей
        prefix = "[ТЕСТ ATLAS] " if test else "[ATLAS] "
        work = req.get("work") or req.get("work_uid", "")
        return (f"{prefix}{req.get('mat', '')} · {req.get('qty', '')} → {work} · "
                f"П{req.get('plot', '')} · к {req.get('need', '')} · "
                f"work_uid {req.get('work_uid', '')}").strip()

    def create_sp178(self, req: dict, test=False, field_map=None, extra=None) -> str:
        """Создать заявку в sp178. title-only по умолчанию (безопасно для ЛЮБОЙ схемы).
        field_map: {bitrix_field_code: req_key} — задаётся ПОСЛЕ probe реальной схемы;
        extra: {field_code: value} — обязательные поля sp178 (из probe), если есть.
        На боевой записи (live) ловим «тихий игнор»: 200 без item.id → заявка НЕ создана;
        а если писали не только title — verify_written проверяет, что UF-поля реально
        записались (иначе BitrixError, чтобы не плодить пустые заявки). В dry — без сети."""
        fields = {"title": self.request_title(req, test=test)}
        for code, key in (field_map or {}).items():
            if req.get(key) not in (None, ""):
                fields[code] = req[key]
        if extra:
            fields.update(extra)
        item = self.add_item(fields)
        item_id = str(item.get("id", ""))
        if self.live:                       # гарды только на боевой записи (dry — без сети)
            if not item_id:                 # ответ 200, но item.id нет → запись не прошла
                raise BitrixError(
                    f"crm.item.add: ответ без item.id — заявка НЕ создана "
                    f"(отправляли: {sorted(fields)})")
            if len(fields) > 1:             # писали не только title → UF-поля должны записаться
                dropped = self.verify_written(item_id, fields)
                if dropped:
                    raise BitrixError(
                        f"crm.item.add #{item_id}: поля тихо НЕ записались "
                        f"(неверные коды? сверь crm.item.fields): {dropped}. "
                        f"Заявка есть в канбане под title — поправь field_map/extra.")
        return item_id


def _scrub(s, b=None):
    """Вырезать токен вебхука из любого текста (защита от утечки в лог/чат)."""
    s = str(s)
    if b and b.webhook:
        s = s.replace(b.webhook, b.masked())
        tok = b.webhook.rstrip("/").split("/")[-1]
        if len(tok) > 6:
            s = s.replace(tok, "****")
    return s


def _main(argv):
    _load_env()
    cmd = argv[1] if len(argv) > 1 else "status"
    live = "--live" in argv
    b = Bitrix(live=live)
    print(f"Bitrix: {b.masked()} · entityTypeId={b.entity}")
    if not b.webhook:
        print("→ положи вебхук в supply_core/.env:")
        print("  BITRIX_WEBHOOK=https://<portal>.bitrix24.ru/rest/<uid>/<token>/")
        return
    try:
        if cmd == "probe":  # read-only: типы + схема + обязательные поля + items
            try:
                types = b.types()
                print("Smart-процессы (crm.type.list):")
                for t in types:
                    mark = " ← текущий BITRIX_SP" if int(t.get("entityTypeId", -1)) == b.entity else ""
                    print(f"  #{t.get('entityTypeId')}  {t.get('title')}{mark}")
                if not any(int(t.get("entityTypeId", -1)) == b.entity for t in types):
                    print(f"  ⚠ entityTypeId={b.entity} НЕ найден — поправь BITRIX_SP в .env!")
            except BitrixError as e:
                print("crm.type.list:", e)
            fields = b.fields()
            print(f"\nПолей в sp178 (#{b.entity}): {len(fields)}")
            for code, m in fields.items():
                flags = " ".join(f for f, on in (
                    ("*req", m.get("isRequired")), ("ro", m.get("isReadOnly")),
                    ("multi", m.get("isMultiple"))) if on)
                print(f"  {code:34} {str(m.get('title'))[:26]:26} [{m.get('type')}] {flags}")
            req = b.required_fields()
            print(f"\nОБЯЗАТЕЛЬНЫЕ на создание ({len(req)}): "
                  + (", ".join(req) if req else "только title — можно писать сразу"))
            items = b.list_items(order={"id": "DESC"})
            print(f"\nПоследние items в sp178: {len(items)}")
            for it in items[:8]:
                print(f"  #{it.get('id')}  {it.get('title')}")
        elif cmd == "list":
            for it in b.list_items(order={"id": "DESC"}):
                print(f"#{it.get('id')}  {it.get('title')}  →  {b.item_url(it.get('id'))}")
        elif cmd == "push-test":
            req = {"mat": "Кабель ВВГнг 3×2.5", "qty": "4 500 м", "work": "Электромонтаж",
                   "work_uid": "AURA-P4-ELE", "plot": 4, "need": "2026-06-14"}
            if not b.live:
                print("DRY (без --live в боевую CRM не пишу).")
            bx = b.create_sp178(req, test=True)
            print(f"item #{bx}  →  {b.item_url(bx)}")
            if b.live and bx.isdigit():
                print("read-back title:", b.get_item(int(bx)).get("title"))  # гард тихого игнора
        elif cmd == "delete":
            print("удалён ✓" if b.delete_item(int(argv[2])) else "—")
        else:
            print("Команды: probe | list | push-test --live | delete <id> --live")
    except Exception as e:
        print("ОШИБКА:", _scrub(e, b))


if __name__ == "__main__":
    import sys
    _main(sys.argv)
