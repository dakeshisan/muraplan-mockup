"""Дашборд рабочего пространства из БД — одно состояние для CLI, веб-UI и ботов.

Считает то же, что мокап: обеспеченность фронтов, очередь по крайнему сроку,
SLA обработки, KPI-источник (приём по Хранителю) — но из живой SQLite, на дату «сегодня».
"""
from .model import risk, slack, order_by, aged, aged_breach, today, RANK
from . import db


def _row(r, rcpt):
    k, label, rank = risk(r)
    return {
        "id": r.id, "mat": r.mat, "qty": r.qty, "work": r.work, "work_uid": r.work_uid,
        "plot": r.plot, "stage": r.stage, "need": r.need,
        "order_by": order_by(r).isoformat(), "slack": slack(r), "aged": aged(r),
        "sla_breach": aged_breach(r), "abc": r.abc, "price": r.price,
        "k": k, "label": label, "rank": rank, "win": r.win,
        "on_time": (bool(rcpt[r.id]["on_time"]) if r.id in rcpt else None),
    }


def dashboard(con) -> dict:
    reqs = db.all_requests(con)
    rcpt = {x["request_id"]: x for x in db.all_receipts(con)}
    rows = [_row(r, rcpt) for r in reqs]

    c = lambda code: sum(1 for x in rows if x["k"] == code)
    status = {
        "onsite": c("done"),
        "inwindow": c("transit") + c("ok"),
        "atrisk": c("hold") + c("late") + c("risk"),
        "breach": c("srv") + c("over"),
        "total": len(rows),
    }
    queue = sorted([x for x in rows if x["rank"] <= RANK["risk"]],
                   key=lambda x: (x["rank"], x["slack"]))
    inproc = sum(1 for x in rows if x["stage"] != "arr")
    overdue = sum(1 for x in rows if x["sla_breach"])
    kpi_ontime = sum(1 for x in rows if x["on_time"])

    return {
        "today": today().isoformat(),
        "status": status,
        "queue": queue,
        "sla": {"inproc": inproc, "overdue": overdue, "ontime": inproc - overdue},
        "kpi": {"accepted_on_time": kpi_ontime},
        "items": rows,
    }
