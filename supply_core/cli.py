"""CLI рабочего пространства снабженца — операции над живой SQLite (DB_PATH).

    python3 -m supply_core.cli init [--reset]      # создать/засеять БД
    python3 -m supply_core.cli report              # дашборд: статус, очередь, SLA
    python3 -m supply_core.cli add "Кабель;100 м;Электромонтаж;AURA-P4-ELE;4;2026-06-20;6"
    python3 -m supply_core.cli stage 8 pay         # двигать стадию заявки
    python3 -m supply_core.cli accept 8 2026-06-13 "100 м"   # приёмка Хранителем
"""
import argparse
import os
from . import db, service, muravey, keeper
from .bitrix import Bitrix
from .model import Request, now

DB = os.environ.get("DB_PATH", "supply.sqlite3")


def _con():
    return db.connect(DB)


def _bitrix():
    return Bitrix(os.environ.get("BITRIX_WEBHOOK"))


def cmd_init(args):
    if args.reset and os.path.exists(DB):
        os.remove(DB)
    con = _con()
    if db.count_requests(con) == 0:
        from .demo import seed_db
        seed_db(con, _bitrix())
        print(f"seed → {DB}: {db.count_requests(con)} заявок")
    else:
        print(f"{DB}: уже {db.count_requests(con)} заявок (--reset чтобы пересоздать)")


def cmd_report(args):
    _print(service.dashboard(_con()))


def cmd_add(args):
    mat, qty, work, wuid, plot, need, lead = args.spec.split(";")
    r = Request(mat, qty, work, wuid, int(plot), need, int(lead), "req",
                now().isoformat(timespec="seconds"))
    rid = muravey.submit_request(_con(), _bitrix(), r)
    print(f"заявка #{rid}: {mat} → {work} к {need}")


def cmd_stage(args):
    db.advance_stage(_con(), args.id, args.stage)
    print(f"#{args.id} → {args.stage}")


def cmd_accept(args):
    con = _con()
    r = db.get_request(con, args.id)
    if not r:
        return print("нет такой заявки")
    res = keeper.accept(con, args.id, args.qty or r.qty, args.date, "Хранитель(CLI)", r.need)
    print(f"#{args.id} принят {args.date}: в срок = {'да' if res['on_time'] else 'нет'}")


def _print(d):
    s = d["status"]
    print(f"== {d['today']} ==  на объекте {s['onsite']} · в окне {s['inwindow']} · "
          f"под риском {s['atrisk']} · срыв {s['breach']}  (всего {s['total']})")
    print(f"SLA обработки: {d['sla']['ontime']}/{d['sla']['inproc']} в срок, "
          f"{d['sla']['overdue']} просрочены  |  приём в срок: {d['kpi']['accepted_on_time']}")
    print("Очередь на сегодня:")
    for q in d["queue"]:
        print(f"  #{q['id']:>2} [{q['label']:<24}] {q['mat']:<20} к {q['need']} · "
              f"до {q['order_by']} · запас {q['slack']:+d}д · в стадии {q['aged']}д"
              f"{' ⚠SLA' if q['sla_breach'] else ''}")


def main():
    p = argparse.ArgumentParser(prog="supply_core.cli")
    sub = p.add_subparsers(dest="cmd", required=True)
    i = sub.add_parser("init"); i.add_argument("--reset", action="store_true"); i.set_defaults(f=cmd_init)
    sub.add_parser("report").set_defaults(f=cmd_report)
    a = sub.add_parser("add"); a.add_argument("spec"); a.set_defaults(f=cmd_add)
    st = sub.add_parser("stage"); st.add_argument("id", type=int)
    st.add_argument("stage", choices=["req", "pay", "arr"]); st.set_defaults(f=cmd_stage)
    ac = sub.add_parser("accept"); ac.add_argument("id", type=int); ac.add_argument("date")
    ac.add_argument("qty", nargs="?"); ac.set_defaults(f=cmd_accept)
    args = p.parse_args()
    args.f(args)


if __name__ == "__main__":
    main()
