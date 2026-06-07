"""Предиктивный план закупа «Аура» — ЧТО ЗАКАЗАТЬ ЗАРАНЕЕ.

Источник: График_поставки_материалов_Аура_блоки_7-8.xlsx (модель смета→ГПР,
помесячная потребность по каждому материалу). Для каждого материала берём
ПЕРВЫЙ месяц потребности → заказать-до = нужен − срок поставки. Только чтение xlsx.

Сроки поставки (lead) — ОЦЕНКА по разделу, калибруется с PM (см. LEAD).
«Сегодня» — из env SUPPLY_TODAY или системных часов.
"""
import os
import re
from datetime import date, timedelta

XLSX = os.environ.get(
    "AURA_XLSX",
    "/Users/bakylichkakamshybaeva/Documents/Claude/"
    "График_поставки_материалов_Аура_блоки_7-8.xlsx")

MON = {"янв": 1, "фев": 2, "мар": 3, "апр": 4, "май": 5, "июн": 6,
       "июл": 7, "авг": 8, "сен": 9, "окт": 10, "ноя": 11, "дек": 12}

# срок поставки по разделу, дней — ОЦЕНКА (калибруем с PM)
LEAD = {"КЖ": 7, "АР": 12, "ВК": 14, "ОВ": 14, "ЭЛ": 14,
        "СС": 21, "АПС": 21, "ВН": 21, "СКС": 21, "БЛ": 10}
RAZDEL = {"КЖ": "Конструкции ж/б", "АР": "Архитектура (кладка/отделка)",
          "ВК": "Водопровод/канализация", "ОВ": "Отопление/вентиляция",
          "ЭЛ": "Электромонтаж", "СС": "Слаботочка", "АПС": "Пожарная сигнализация",
          "ВН": "Видеонаблюдение", "СКС": "Сети связи", "БЛ": "Благоустройство"}


def today():
    v = os.environ.get("SUPPLY_TODAY")
    return date.fromisoformat(v) if v else date.today()


def _mdate(lbl):
    m = re.match(r"([а-яё]+)\.?\s*(\d{2})", str(lbl).strip().lower())
    if not m:
        return None
    mon = MON.get(m.group(1)[:3])
    return date(2000 + int(m.group(2)), mon, 1) if mon else None


def load_rows():
    import openpyxl
    wb = openpyxl.load_workbook(XLSX, read_only=True, data_only=True)
    ws = wb["График (детально)"]
    rows = list(ws.iter_rows(min_row=4, values_only=True))
    hdr = rows[0]
    moncols = [(i, _mdate(hdr[i])) for i in range(len(hdr)) if _mdate(hdr[i])]
    out = []
    for r in rows[1:]:
        if not r or r[0] is None or not str(r[3] or "").strip():
            continue
        need = None
        for i, dt in moncols:
            try:
                v = float(r[i]) if r[i] not in (None, "") else 0
            except (TypeError, ValueError):
                v = 0
            if v > 0:
                need = dt
                break
        out.append({"block": r[1], "razd": str(r[2] or "").strip(),
                    "name": str(r[3]).strip(), "unit": r[4],
                    "qty": r[6], "cost": r[7], "need": need})
    return out


def plan(t=None, horizon_days=150):
    """Позиции к заказу: первый месяц потребности ещё впереди (или текущий),
    а крайний срок заказа в пределах горизонта. Сортировка по запасу (срочное вверху)."""
    t = t or today()
    cur_month = date(t.year, t.month, 1)
    items = []
    for r in load_rows():
        if not r["need"] or r["need"] < cur_month:
            continue  # потребность уже началась/прошла → считаем заказанным
        lead = LEAD.get(r["razd"], 10)
        order_by = r["need"] - timedelta(days=lead)
        slack = (order_by - t).days
        if slack > horizon_days:
            continue  # ещё рано планировать
        st = ("overdue" if slack < 0 else "now" if slack <= 7
              else "soon" if slack <= 30 else "plan")
        items.append({
            "block": r["block"], "razd": r["razd"], "razdel": RAZDEL.get(r["razd"], r["razd"]),
            "name": r["name"], "unit": r["unit"], "qty": r["qty"], "cost": r["cost"],
            "need": r["need"].isoformat(), "need_month": r["need"].strftime("%m.%Y"),
            "order_by": order_by.isoformat(), "slack": slack, "lead": lead, "status": st})
    items.sort(key=lambda x: x["slack"])
    return items


def summary(t=None, horizon_days=150):
    from collections import Counter
    t = t or today()
    items = plan(t, horizon_days)
    by_status = Counter(i["status"] for i in items)
    by_razdel = Counter(i["razdel"] for i in items)
    om = {}
    for i in items:
        e = om.setdefault(i["order_by"][:7], {"month": i["order_by"][:7], "count": 0, "cost": 0})
        e["count"] += 1
        e["cost"] += (i["cost"] or 0)
    by_block = Counter(str(i["block"]) for i in items)
    return {
        "today": t.isoformat(), "horizon_days": horizon_days,
        "total": len(items),
        "earliest": items[0]["order_by"] if items else None,
        "total_cost": sum((i["cost"] or 0) for i in items),
        "order_now_cost": sum((i["cost"] or 0) for i in items if i["status"] in ("overdue", "now")),
        "by_status": {k: by_status.get(k, 0) for k in ("overdue", "now", "soon", "plan")},
        "by_razdel": sorted(by_razdel.items(), key=lambda x: -x[1]),
        "by_order_month": sorted(om.values(), key=lambda x: x["month"]),
        "by_block": sorted(by_block.items()),
        "items": items[:250],
    }


if __name__ == "__main__":
    s = summary()
    print(f"План закупа «Аура» · сегодня {s['today']} · горизонт {s['horizon_days']}д")
    print(f"Позиций к заказу: {s['total']}  ·  по статусу: {s['by_status']}")
    print(f"Сумма к заказу сейчас/просрочено: ~{s['order_now_cost']/1e6:.1f} млн ₸")
    print("По разделам:", ", ".join(f"{k}:{v}" for k, v in s["by_razdel"]))
    print("\nСамое срочное:")
    for i in s["items"][:12]:
        print(f"  [{i['status']:7}] до {i['order_by']} (запас {i['slack']:+}д) · "
              f"{i['razd']:3} · {i['name'][:40]:40} · {i['qty']} {i['unit']}")
