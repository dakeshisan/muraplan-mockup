"""End-to-end прогон ядра на условных данных ЖК «Аура» (БЕЗ Telegram/Bitrix).

Заполняет БД через Муравья, принимает пришедшее Хранителем, печатает дашборд из
service — те же цифры, что в мокапе, но из живой SQLite на дату «сегодня».

    python3 -m supply_core.demo
"""
from . import db, seed, service, muravey, keeper
from .bitrix import Bitrix


def seed_db(con, bitrix=None):
    """Залить стартовые заявки (Муравей) и принять пришедшее (Хранитель)."""
    bitrix = bitrix or Bitrix(dry_run=True)
    items = seed.build()
    ids = {}
    for r in items:
        ids[r.mat] = muravey.submit_request(con, bitrix, r)
    for r in items:
        if r.mat in seed.ACCEPTED_OFFSET:
            keeper.accept(con, ids[r.mat], r.qty, seed.accepted_date(r.mat),
                          "Хранитель П3", r.need)
    return ids


def main():
    con = db.connect()  # in-memory
    print("=" * 64)
    print("ATLAS · Снабжение — демо ядра (наблюдательный режим, условные данные)")
    print("=" * 64)
    print("\n■ Муравей: заявки недели → БД → Bitrix sp178 (dry-run)")
    seed_db(con)

    d = service.dashboard(con)
    s = d["status"]
    print(f"  → {s['total']} заявок в БД\n")
    print("■ Хранитель: принято на пятне (источник «в срок», не самоотметка):")
    for it in d["items"]:
        if it["on_time"] is not None:
            print(f"  {it['mat']:<22} → в срок: {'да' if it['on_time'] else 'НЕТ'}")

    print(f"\n■ Обеспеченность фронтов ({d['today']}):")
    print(f"  на объекте {s['onsite']} · в окне {s['inwindow']} · "
          f"под риском {s['atrisk']} · срыв {s['breach']}   (всего {s['total']})")

    print("\n■ Очередь на сегодня (крайний срок = срок работы − срок поставки):")
    for q in d["queue"]:
        print(f"  [{q['label']:<26}] {q['mat']:<22} → {q['work']} (П{q['plot']}) "
              f"к {q['need']} · заказать-до {q['order_by']} · запас {q['slack']:+d}д · "
              f"в стадии {q['aged']}д{' ⚠SLA' if q['sla_breach'] else ''}")

    sla = d["sla"]
    print(f"\n■ SLA обработки заявок: {sla['ontime']}/{sla['inproc']} в срок · "
          f"{sla['overdue']} просрочены")
    print(f"■ KPI-источник (наблюдательно): принято Хранителем в срок "
          f"{d['kpi']['accepted_on_time']} фронт(а) — на премию не влияет (Фаза 2)\n")
    return con


if __name__ == "__main__":
    main()
