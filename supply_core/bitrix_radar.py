"""Оплата-радар: read-only срез боевой воронки снабжения Bitrix (#178/4
«СЗ на закуп для стройки»). Показывает, где копится задержка на оплате.

ТОЛЬКО ЧТЕНИЕ (crm.item.list / user.get). В Bitrix ничего не пишет.
Слой ATLAS: к стадии оплаты добавляем «сколько висит» (узкое место по срокам).
"""
import re
from collections import Counter
from datetime import date, datetime

from .bitrix import Bitrix, BitrixError

ENTITY = 178
CATEGORY = 4
STAGES = {
    "DT178_4:NEW": "Новая заявка",
    "DT178_4:UC_0H88GF": "Запрос счёта / доработка",
    "DT178_4:UC_4D8JR5": "Согласование оплаты счетов",
    "DT178_4:UC_O7DV6N": "Согласовано на оплату",
    "DT178_4:UC_M583Q3": "Оплата траншами",
    "DT178_4:UC_ROWHWH": "Есть неоплаченные счета",
    "DT178_4:UC_0MHST0": "Оплата",
    "DT178_4:UC_35M6HC": "Забор товара",
    "DT178_4:UC_SPB49U": "Закрывающие документы",
    "DT178_4:SUCCESS": "Успешно",
    "DT178_4:FAIL": "Отказано",
}
PAYMENT = {"DT178_4:UC_4D8JR5", "DT178_4:UC_O7DV6N", "DT178_4:UC_M583Q3",
           "DT178_4:UC_ROWHWH", "DT178_4:UC_0MHST0"}
CLOSED = ["DT178_4:SUCCESS", "DT178_4:FAIL"]
CLOSING = {"DT178_4:UC_SPB49U"}                 # стадия «Закрывающие документы»
STAGE_SETS = {
    "payment": {"stages": PAYMENT, "title": "оплата", "label": "на оплате"},
    "closing": {"stages": CLOSING, "title": "закрывающие документы", "label": "в закрывающих"},
}

# объект стройки — эвристика по заголовку заявки (порядок важен: ЖК раньше подрядчиков)
OBJECTS = [
    (r"аур", "Аура"),
    (r"атмосфер", "Атмосфера"),
    (r"арлан|arlan", "Арлан"),
    (r"keruen|керуен", "Keruen"),
    (r"aqsa[yi]|акса[йи]", "Aqsay Resort"),
]


def object_of(title):
    t = (title or "").lower()
    for pat, name in OBJECTS:
        if re.search(pat, t):
            return name
    # дефолтный заголовок / пустые сегменты — заявка заведена без объекта (сигнал качества)
    if "служебная записка на закуп" in t or re.search(r"/\s*/\s*/\s*/", t):
        return "Черновик · без деталей"
    return "Прочее"


def _days(ts, today):
    try:
        return (today - datetime.fromisoformat(ts).date()).days
    except Exception:
        return None


def _bucket(d):
    return ("0–3" if d <= 3 else "4–7" if d <= 7 else "8–14" if d <= 14
            else "15–30" if d <= 30 else "30+")


def _resolve_users(b, ids):
    """Имена согласующих (best-effort). Если первый вызов падает (нет scope `user`) —
    НЕ долбим CRM остальными, отдаём ID для всех (иначе первый аплоад радара висит)."""
    names = {}
    for uid in ids:
        try:
            r = b.call("user.get", {"ID": uid})
            u = (r[0] if isinstance(r, list) and r else {}) or {}
            nm = " ".join(x for x in (u.get("NAME"), u.get("LAST_NAME")) if x).strip()
            names[uid] = nm or f"ID {uid}"
        except BitrixError:
            for u2 in ids:
                names.setdefault(u2, f"ID {u2}")
            break
    return names


def radar(view="payment", today=None, max_pages=12):
    b = Bitrix()  # read-only (live=False)
    if not b.webhook:
        return {"error": "нет BITRIX_WEBHOOK в supply_core/.env"}
    today = today or date.today()
    sset = STAGE_SETS.get(view, STAGE_SETS["payment"])
    # ВСЕ заявки на стадиях оплаты — ID-курсор (start=-1, БЕЗ медленного COUNT).
    # Фильтром по стадиям оплаты — не пропустим старые/застрявшие.
    pay, last = [], 0
    for _ in range(max_pages):
        body = b.call("crm.item.list", {
            "entityTypeId": ENTITY,
            "select": ["id", "title", "stageId", "movedTime", "createdTime", "assignedById"],
            "filter": {"categoryId": CATEGORY, "@stageId": list(sset["stages"]), ">id": last},
            "order": {"id": "ASC"}, "start": -1}, raw=True)
        page = (body.get("result") or {}).get("items", [])
        pay += page
        if len(page) < 50:
            break
        last = page[-1]["id"]
    active_total = None  # точный COUNT дорог (operating-time); показываем число на оплате
    rows = []
    for it in pay:
        d = _days(it.get("movedTime"), today)
        title = (it.get("title") or "").strip()
        rows.append({
            "id": it["id"], "title": title, "object": object_of(title),
            "stage": STAGES.get(it.get("stageId"), it.get("stageId")),
            "days": d, "url": b.item_url(it["id"]),
            "assignedById": it.get("assignedById")})
    rows.sort(key=lambda r: -(r["days"] if r["days"] is not None else -1))

    # разрез по объектам (на оплате)
    objs = {}
    for r in rows:
        e = objs.setdefault(r["object"],
                            {"name": r["object"], "count": 0, "stuck30": 0, "max": 0})
        e["count"] += 1
        dd = r["days"] or 0
        if dd > 30:
            e["stuck30"] += 1
        e["max"] = max(e["max"], dd)
    objects = sorted(objs.values(), key=lambda x: -x["count"])
    dwells = sorted(r["days"] for r in rows if r["days"] is not None)
    med = dwells[len(dwells) // 2] if dwells else 0

    # по согласующим (кто тормозит оплату)
    by_uid = {}
    for r in rows:
        u = r["assignedById"]
        if u is None:
            continue
        e = by_uid.setdefault(u, {"count": 0, "max": 0})
        e["count"] += 1
        e["max"] = max(e["max"], r["days"] or 0)
    top = sorted(by_uid.items(), key=lambda x: -x[1]["count"])[:8]
    names = _resolve_users(b, [u for u, _ in top])
    assignees = [{"name": names.get(u, f"ID {u}"), **v} for u, v in top]

    aging = Counter(_bucket(r["days"]) for r in rows if r["days"] is not None)
    substages = Counter(r["stage"] for r in rows)

    return {
        "funnel": "СЗ на закуп для стройки · #178/4",
        "portal": b.portal,
        "today": today.isoformat(),
        "active_total": active_total,
        "view": view, "title": sset["title"], "label": sset["label"],
        "count": len(pay),
        "median_days": med,
        "max_days": max(dwells) if dwells else 0,
        "overdue14": sum(1 for d in dwells if d > 14),
        "aging": [[k, aging.get(k, 0)] for k in ("0–3", "4–7", "8–14", "15–30", "30+")],
        "substages": sorted(substages.items(), key=lambda x: -x[1]),
        "assignees": assignees,
        "objects": objects,
        "rows": [{k: v for k, v in r.items() if k != "assignedById"} for r in rows[:150]],
    }


STAGE_ORDER = [
    "DT178_4:NEW", "DT178_4:UC_0H88GF", "DT178_4:UC_4D8JR5", "DT178_4:UC_O7DV6N",
    "DT178_4:UC_M583Q3", "DT178_4:UC_ROWHWH", "DT178_4:UC_0MHST0",
    "DT178_4:UC_35M6HC", "DT178_4:UC_SPB49U",
]


def cycle_time(today=None, max_pages=20):
    """Цикл закупа: по каждой стадии воронки — сколько активных заявок и медиана
    дней «в стадии» (cross-section: где сейчас копятся и стареют заявки). Read-only."""
    b = Bitrix()
    if not b.webhook:
        return {"error": "нет BITRIX_WEBHOOK в supply_core/.env"}
    today = today or date.today()
    items, last = [], 0
    for _ in range(max_pages):
        body = b.call("crm.item.list", {
            "entityTypeId": ENTITY,
            "select": ["id", "stageId", "movedTime", "createdTime"],
            "filter": {"categoryId": CATEGORY, "!@stageId": CLOSED, ">id": last},
            "order": {"id": "ASC"}, "start": -1}, raw=True)
        page = (body.get("result") or {}).get("items", [])
        items += page
        if len(page) < 50:
            break
        last = page[-1]["id"]

    def med(xs):
        xs = sorted(x for x in xs if x is not None)
        return xs[len(xs) // 2] if xs else 0

    bucket = {}
    for it in items:
        bucket.setdefault(it.get("stageId"), []).append(
            (_days(it.get("movedTime"), today), _days(it.get("createdTime"), today)))
    stages = []
    for sid in STAGE_ORDER:
        arr = bucket.get(sid, [])
        dl = [d for d, a in arr if d is not None]
        stages.append({
            "stage": STAGES.get(sid, sid), "count": len(arr),
            "median_dwell": med([d for d, a in arr]),
            "max_dwell": max(dl) if dl else 0,
            "median_age": med([a for d, a in arr])})
    return {
        "funnel": "СЗ на закуп для стройки · #178/4", "portal": b.portal,
        "today": today.isoformat(), "total_active": len(items), "stages": stages}


def gaps(today=None, max_pages=16):
    """Детектор «не подано»: план ГПР (что нужно закупить) vs заявки воронки (по
    ключевым словам в заголовках). Материал нужен срочно/просрочено, а заявки не
    видно → сигнал «возможно забыли подать». Эвристика по заголовкам — сигнал «проверь»."""
    import re as _re
    from . import gpr_plan
    b = Bitrix()
    if not b.webhook:
        return {"error": "нет BITRIX_WEBHOOK в supply_core/.env"}
    today = today or date.today()
    blobs, last = {}, 0
    for _ in range(max_pages):
        body = b.call("crm.item.list", {
            "entityTypeId": ENTITY, "select": ["id", "title"],
            "filter": {"categoryId": CATEGORY, "!@stageId": CLOSED, ">id": last},
            "order": {"id": "ASC"}, "start": -1}, raw=True)
        page = (body.get("result") or {}).get("items", [])
        for it in page:
            o = object_of(it.get("title"))
            blobs[o] = blobs.get(o, "") + " " + (it.get("title") or "").lower()
        if len(page) < 50:
            break
        last = page[-1]["id"]
    PLAN2OBJ = {"aura": "Аура", "atmo": "Атмосфера", "aksai": "Aqsay Resort", "keruen": "Keruen"}
    ST_RANK = {"overdue": 0, "now": 1, "soon": 2, "plan": 3}
    out = []
    for key, oname in PLAN2OBJ.items():
        bymat = {}
        for it in gpr_plan.plan(key, today):
            e = bymat.setdefault(it["material"], {
                "material": it["material"], "count": 0,
                "earliest": it["order_by"], "status": it["status"]})
            e["count"] += 1
            if it["order_by"] < e["earliest"]:
                e["earliest"] = it["order_by"]
            if ST_RANK[it["status"]] < ST_RANK[e["status"]]:
                e["status"] = it["status"]
        blob = blobs.get(oname, "")
        mats = list(bymat.values())
        for e in mats:
            kw = gpr_plan.MAT_KW.get(e["material"])
            e["found"] = bool(kw and _re.search(kw, blob))
        mats.sort(key=lambda x: (ST_RANK.get(x["status"], 9), x["earliest"]))
        out.append({
            "object": gpr_plan.OBJ_NAMES[key], "key": key, "materials": mats,
            "not_submitted": sum(1 for m in mats if not m["found"]
                                 and m["status"] in ("overdue", "now", "soon"))})
    return {"today": today.isoformat(), "objects": out}


if __name__ == "__main__":
    import json
    d = radar()
    print(json.dumps({k: v for k, v in d.items() if k != "rows"},
                     ensure_ascii=False, indent=2))
    print("rows:", len(d.get("rows", [])))
