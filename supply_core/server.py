"""Локальный веб-сервер рабочего пространства снабженца (stdlib, без зависимостей).

    python3 -m supply_core.server      →  http://127.0.0.1:8770

Это рабочее приложение: снабженец заводит заявки, двигает стадии, фиксирует приёмку;
дедлайны (заказать-до) и SLA считаются вживую на дату «сегодня», данные в SQLite (DB_PATH).
Bitrix/Telegram не требуются для работы UI — они опциональный боевой мост (от PM).
"""
import base64
import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse
from . import db, service, muravey, keeper
from .bitrix import Bitrix
from .model import Request, now

DB = os.environ.get("DB_PATH", "supply.sqlite3")
HERE = os.path.dirname(__file__)
PORT = int(os.environ.get("PORT", "8770"))
# HTTP Basic Auth — включается, только если задан ATLAS_PASS (для онлайн-доступа
# через туннель/VPS). Локально без пароля. Логин по умолчанию atlas.
AUTH_USER = os.environ.get("ATLAS_USER", "atlas")
AUTH_PASS = os.environ.get("ATLAS_PASS")

import time as _time
_RADAR = {}


def _radar_cached(view="payment", ttl=300):
    """Радар Bitrix (view=payment|closing) с кэшем по view."""
    from . import bitrix_radar
    from .bitrix import _scrub
    e = _RADAR.get(view)
    if e and (_time.time() - e["t"]) < ttl:
        return e["data"]
    try:
        data = bitrix_radar.radar(view)
    except Exception as ex:
        return {"error": _scrub(str(ex), Bitrix())}
    if not data.get("error"):
        _RADAR[view] = {"t": _time.time(), "data": data}
    return data


def _cycle_cached(ttl=300):
    """Цикл закупа (дни в стадиях) с кэшем."""
    from . import bitrix_radar
    from .bitrix import _scrub
    e = _RADAR.get("__cycle__")
    if e and (_time.time() - e["t"]) < ttl:
        return e["data"]
    try:
        data = bitrix_radar.cycle_time()
    except Exception as ex:
        return {"error": _scrub(str(ex), Bitrix())}
    if not data.get("error"):
        _RADAR["__cycle__"] = {"t": _time.time(), "data": data}
    return data


def _gaps_cached(ttl=300):
    """Детектор «не подано» (план ГПР vs заявки) с кэшем."""
    from . import bitrix_radar
    from .bitrix import _scrub
    e = _RADAR.get("__gaps__")
    if e and (_time.time() - e["t"]) < ttl:
        return e["data"]
    try:
        data = bitrix_radar.gaps()
    except Exception as ex:
        return {"error": _scrub(str(ex), Bitrix())}
    if not data.get("error"):
        _RADAR["__gaps__"] = {"t": _time.time(), "data": data}
    return data


def _today_payload():
    """Сводка дня: композиция уже кэшированных срезов (оплата / закрывающие /
    план ГПР / не подано) в один экран «что горит сегодня». Только чтение."""
    pay = _radar_cached("payment")
    clo = _radar_cached("closing")
    plan = _gpr_cached("all")
    gap = _gaps_cached()
    out = {"today": (plan.get("today") or pay.get("today") or gap.get("today")), "errors": []}
    if pay.get("error"):
        out["errors"].append("оплата: " + pay["error"])
    else:
        out["pay"] = {"count": pay["count"], "median": pay["median_days"],
                      "over14": pay["overdue14"], "max": pay["max_days"]}
    if not clo.get("error"):
        out["closing"] = {"count": clo["count"], "over14": clo["overdue14"]}
    gapby = {}
    if not gap.get("error"):
        gapby = {o["object"]: o["not_submitted"] for o in gap["objects"]}
        out["gaps"] = {"total": sum(gapby.values()),
                       "by_object": [{"object": k, "n": v} for k, v in gapby.items()]}
    if plan.get("error"):
        out["errors"].append("план: " + plan["error"])
    else:
        bs = plan["by_status"]
        out["plan"] = {"overdue": bs["overdue"], "now": bs["now"], "soon": bs["soon"],
                       "earliest": plan["earliest"]}
        out["risk"] = sorted(
            [{"object": o["object"], "overdue": o["overdue"], "earliest": o["earliest"],
              "gaps": gapby.get(o["object"], 0)} for o in plan.get("by_object", [])],
            key=lambda r: (-r["overdue"], -r["gaps"]))
        agg = {}
        for i in plan.get("items", []):
            if i["status"] not in ("overdue", "now"):
                continue
            k = (i.get("object"), i["material"])
            e = agg.get(k)
            if not e:
                agg[k] = {"object": i.get("object"), "material": i["material"],
                          "order_by": i["order_by"], "slack": i["slack"],
                          "status": i["status"], "count": 1}
            else:
                e["count"] += 1
                e["order_by"] = min(e["order_by"], i["order_by"])
                e["slack"] = min(e["slack"], i["slack"])
                if i["status"] == "overdue":
                    e["status"] = "overdue"
        out["order_now"] = sorted(agg.values(), key=lambda x: x["slack"])[:40]
    return out


_PLAN = {"t": 0.0, "data": None}


def _plan_cached(ttl=600):
    """Предиктивный план закупа «Аура» с кэшем (xlsx не парсим на каждый запрос)."""
    from . import aura_plan
    if _PLAN["data"] and (_time.time() - _PLAN["t"]) < ttl:
        return _PLAN["data"]
    try:
        data = aura_plan.summary()
    except Exception as e:
        return {"error": str(e)}
    if not data.get("error"):
        _PLAN.update(t=_time.time(), data=data)
    return data


# реестр объектов плана закупа (несколько графиков; наполняем по мере сборки смет)
ZAKUP_OBJECTS = [
    {"key": "all", "name": "Все объекты", "status": "live", "plan": "/api/gpr/plan?obj=all"},
    {"key": "aura", "name": "Аура", "status": "live", "plan": "/api/gpr/plan?obj=aura"},
    {"key": "atmo", "name": "Атмосфера", "status": "live", "plan": "/api/gpr/plan?obj=atmo"},
    {"key": "aksai", "name": "Aqsai Resort", "status": "live", "plan": "/api/gpr/plan?obj=aksai"},
    {"key": "keruen", "name": "Керуен", "status": "live", "plan": "/api/gpr/plan?obj=keruen"},
]
_GPR = {}


def _gpr_cached(obj, ttl=600):
    """План закупа по ГПР объекта (PDF) с кэшем (PDF не парсим на каждый запрос)."""
    from . import gpr_plan
    e = _GPR.get(obj)
    if e and (_time.time() - e["t"]) < ttl:
        return e["data"]
    try:
        data = gpr_plan.summary_all() if obj == "all" else gpr_plan.summary(obj)
    except Exception as ex:
        return {"error": str(ex)}
    if not data.get("error"):
        _GPR[obj] = {"t": _time.time(), "data": data}
    return data


def ensure_seed():
    con = db.connect(DB)
    if db.count_requests(con) == 0:
        from .demo import seed_db
        seed_db(con, Bitrix(os.environ.get("BITRIX_WEBHOOK")))
    con.close()


class Handler(BaseHTTPRequestHandler):
    def _send(self, code, body, ctype="application/json"):
        b = body if isinstance(body, bytes) else json.dumps(body, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", ctype + "; charset=utf-8")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def _auth_ok(self):
        """HTTP Basic Auth. Если ATLAS_PASS не задан — пускаем (локальный режим)."""
        if not AUTH_PASS:
            return True
        hdr = self.headers.get("Authorization", "")
        if hdr.startswith("Basic "):
            try:
                u, _, p = base64.b64decode(hdr[6:]).decode("utf-8").partition(":")
                # сравнение без раннего выхода по времени
                import hmac
                if hmac.compare_digest(u, AUTH_USER) and hmac.compare_digest(p, AUTH_PASS):
                    return True
            except Exception:
                pass
        self.send_response(401)
        self.send_header("WWW-Authenticate", 'Basic realm="ATLAS Supply"')
        self.send_header("Content-Length", "0")
        self.end_headers()
        return False

    def do_GET(self):
        if not self._auth_ok():
            return
        path = urlparse(self.path).path
        if path in ("/", "/index.html", "/workspace.html"):
            with open(os.path.join(HERE, "workspace.html"), "rb") as f:
                return self._send(200, f.read(), "text/html")
        if path == "/api/state":
            con = db.connect(DB)
            try:
                return self._send(200, service.dashboard(con))
            finally:
                con.close()
        if path == "/radar":
            with open(os.path.join(HERE, "radar.html"), "rb") as f:
                return self._send(200, f.read(), "text/html")
        if path == "/api/bitrix/radar":
            from urllib.parse import parse_qs
            view = parse_qs(urlparse(self.path).query).get("view", ["payment"])[0]
            return self._send(200, _radar_cached(view))
        if path == "/cycle":
            with open(os.path.join(HERE, "cycle.html"), "rb") as f:
                return self._send(200, f.read(), "text/html")
        if path == "/api/bitrix/cycle":
            return self._send(200, _cycle_cached())
        if path == "/gaps":
            with open(os.path.join(HERE, "gaps.html"), "rb") as f:
                return self._send(200, f.read(), "text/html")
        if path == "/api/bitrix/gaps":
            return self._send(200, _gaps_cached())
        if path in ("/today", "/svodka"):
            with open(os.path.join(HERE, "today.html"), "rb") as f:
                return self._send(200, f.read(), "text/html")
        if path == "/api/today":
            return self._send(200, _today_payload())
        if path.startswith("/export/buylist."):
            from . import export as _exp
            data = _gpr_cached("all")
            rows = _exp.buylist_rows(data)
            body, ctype, fn = (_exp.to_csv(rows, data.get("today")) if path.endswith(".csv")
                               else _exp.to_xlsx(rows, data.get("today")))
            self.send_response(200)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Disposition", f'attachment; filename="{fn}"')
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            return self.wfile.write(body)
        if path == "/zakup":
            with open(os.path.join(HERE, "zakup.html"), "rb") as f:
                return self._send(200, f.read(), "text/html")
        if path == "/api/aura/plan":
            return self._send(200, _plan_cached())
        if path == "/api/zakup/objects":
            return self._send(200, ZAKUP_OBJECTS)
        if path == "/api/gpr/plan":
            from urllib.parse import parse_qs
            obj = parse_qs(urlparse(self.path).query).get("obj", ["aura"])[0]
            return self._send(200, _gpr_cached(obj))
        return self._send(404, {"error": "not found"})

    def do_POST(self):
        if not self._auth_ok():
            return
        path = urlparse(self.path).path
        n = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(n) or b"{}")
        con = db.connect(DB)
        try:
            if path == "/api/request":
                r = Request(body["mat"], body.get("qty", ""), body["work"], body["work_uid"],
                            int(body["plot"]), body["need"], int(body.get("lead", 5)), "req",
                            now().isoformat(timespec="seconds"), abc=body.get("abc", "B"))
                rid = muravey.submit_request(con, Bitrix(os.environ.get("BITRIX_WEBHOOK")), r)
                return self._send(200, {"id": rid})
            if path == "/api/accept":
                r = db.get_request(con, int(body["id"]))
                if not r:
                    return self._send(404, {"error": "no request"})
                res = keeper.accept(con, int(body["id"]), body.get("qty") or r.qty,
                                    body["date"], "Хранитель(web)", r.need)
                return self._send(200, res)
            if path == "/api/stage":
                db.advance_stage(con, int(body["id"]), body["stage"])
                return self._send(200, {"ok": True})
            return self._send(404, {"error": "not found"})
        finally:
            con.close()

    def log_message(self, *a):
        pass


def main():
    ensure_seed()
    host = os.environ.get("HOST", "127.0.0.1")   # HOST=0.0.0.0 — доступ по локальной сети
    srv = ThreadingHTTPServer((host, PORT), Handler)
    print(f"ATLAS · Снабжение — рабочее пространство → http://127.0.0.1:{PORT}  (БД: {DB})")
    print(f"           сводка дня (кокпит)           → http://127.0.0.1:{PORT}/today")
    print(f"           оплата-радар Bitrix          → http://127.0.0.1:{PORT}/radar")
    print(f"           план закупа (Аура)           → http://127.0.0.1:{PORT}/zakup")
    # прогрев всех кэшей кокпита в фоне, чтобы «Сводка дня» открылась мгновенно
    import threading
    threading.Thread(target=lambda: (_radar_cached("payment"), _radar_cached("closing"),
                                      _gpr_cached("all"), _gaps_cached()), daemon=True).start()
    srv.serve_forever()


if __name__ == "__main__":
    main()
