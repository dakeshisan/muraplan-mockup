"""Предиктивный план закупа из ГПР-отчётов (PDF) по объектам — «что заказать заранее».

Парсит читаемые PDF «Отчёт о выполнении ГПР» (gpr_pdf/<obj>.pdf): по каждому пятну/работе —
план/факт %, начало, окончание. work_type → материалы → срок поставки (lead, ОЦЕНКА),
заказать-до = начало работы − lead. Только чтение. Покрывает все объекты сразу.
"""
import os
import re
from datetime import date, timedelta

GPR_DIR = os.environ.get(
    "GPR_DIR", "/Users/bakylichkakamshybaeva/Documents/Claude/gpr_pdf")
OBJ_NAMES = {"aura": "Аура", "atmo": "Атмосфера", "aksai": "Aqsai Resort", "keruen": "Керуен"}

# работа (по ключу в названии) → материалы + срок поставки (дн, ОЦЕНКА, калибруем)
WORK_MAT = [
    (r"бетонные работы|каркас", "Бетон, арматура, опалубка", 7),
    (r"кладка", "Газоблок, кладочный раствор", 5),
    (r"фасад", "Утеплитель, штукатурка, сетка", 12),
    (r"монтаж окон|^окна|окон", "Окна ПВХ", 14),
    (r"кровл", "Гидроизоляция кровли", 10),
    (r"стяжк|устройство полов", "ЦПС, ровнители", 5),
    (r"керамогранит", "Керамогранит", 14),
    (r"двери", "Двери", 21),
    (r"лифт", "Лифтовое оборудование", 60),
    (r"отопление", "Трубы, радиаторы", 14),
    (r"вентиляц", "Воздуховоды", 14),
    (r"водопровод", "Трубы ВК, арматура", 14),
    (r"канализац", "Трубы канализации", 10),
    (r"электромонтаж", "Кабель, щиты", 14),
    (r"светильник", "Светильники", 14),
    (r"апс|пожарн", "АПС оборудование", 21),
    (r"видеонаб", "Камеры", 45),
    (r"домофон", "Домофоны", 45),
    (r"бордюр|поребрик", "Бордюрный камень", 10),
    (r"брусчатк", "Брусчатка", 10),
    (r"асфальт", "Асфальт", 7),
    (r"озелен", "Саженцы, грунт", 7),
    (r"наружное освещение", "Опоры, светильники", 21),
]

# ключевые слова материала для поиска в заголовках заявок Bitrix (детектор «не подано»)
MAT_KW = {
    "Бетон, арматура, опалубка": r"бетон|армат|опалуб|каркас|фундамент",
    "Газоблок, кладочный раствор": r"газоблок|кладк",
    "Утеплитель, штукатурка, сетка": r"утеплит|фасад|штукатур",
    "Окна ПВХ": r"окн|пвх|витраж",
    "Гидроизоляция кровли": r"кровл|гидроизол",
    "ЦПС, ровнители": r"цпс|стяжк|ровнит|пескобетон",
    "Керамогранит": r"керамогранит|плитк|керамо",
    "Двери": r"двер",
    "Лифтовое оборудование": r"лифт",
    "Трубы, радиаторы": r"отоплен|радиатор|труб",
    "Воздуховоды": r"вентиляц|воздуховод",
    "Трубы ВК, арматура": r"водопровод|труб|сантех",
    "Трубы канализации": r"канализац|труб",
    "Кабель, щиты": r"кабел|электро|щит|провод",
    "Светильники": r"светильник|освещ",
    "АПС оборудование": r"апс|пожарн|сигнализ|оповещ",
    "Камеры": r"камер|видеонаб|cctv",
    "Домофоны": r"домофон",
    "Бордюрный камень": r"бордюр|поребрик",
    "Брусчатка": r"брусчат|тротуар",
    "Асфальт": r"асфальт",
    "Саженцы, грунт": r"озелен|саженц|грунт|дерев",
    "Опоры, светильники": r"наружн.*освещ|опор|фонар",
}

PCT = re.compile(r"^(\d{1,3})%$")
DATE = re.compile(r"^(\d{1,2})\.(\d{2})\.(\d{4})$")
INT = re.compile(r"^\d+$")
BLOCK = re.compile(r'Пятно\s*["“”\']?\s*(\d+)', re.I)


def today():
    v = os.environ.get("SUPPLY_TODAY")
    return date.fromisoformat(v) if v else date.today()


def _d(s):
    m = DATE.match(s)
    return date(int(m.group(3)), int(m.group(2)), int(m.group(1))) if m else None


def material_for(name):
    n = name.lower()
    for pat, mat, lead in WORK_MAT:
        if re.search(pat, n):
            return mat, lead
    return None, None


def parse_object(key):
    import fitz
    path = os.path.join(GPR_DIR, key + ".pdf")
    if not os.path.exists(path):
        return []
    doc = fitz.open(path)
    pages = [p.get_text() for p in doc]
    plots = re.findall(r'Пятно\s*["“”\']?\s*(\d+)\s*["“”\']?\s*(\d+)\s*очеред',
                       "\n".join(pages), re.I)
    toks = [l.strip() for t in pages for l in t.splitlines() if l.strip()]
    works, block_idx = [], 0
    i = 0
    while i < len(toks):
        t = toks[i]
        if INT.match(t) and int(t) < 100:                 # № работы
            j, name = i + 1, []
            while j < len(toks) and not PCT.match(toks[j]) and len(name) < 4:
                if BLOCK.search(toks[j]):
                    break
                name.append(toks[j]); j += 1
            if (j + 3 < len(toks) and PCT.match(toks[j]) and PCT.match(toks[j + 1])
                    and DATE.match(toks[j + 2]) and DATE.match(toks[j + 3])):
                nm = " ".join(name)
                if re.match(r"земл", nm.lower()):           # №1 «Земляные» = новый блок
                    block_idx += 1
                works.append({
                    "block": block_idx, "work": nm,
                    "plan": int(PCT.match(toks[j]).group(1)),
                    "fact": int(PCT.match(toks[j + 1]).group(1)),
                    "start": _d(toks[j + 2]), "end": _d(toks[j + 3])})
                i = j + 4
                for _ in range(2):                          # пропустить дни + отставание
                    if i < len(toks) and INT.match(toks[i]):
                        i += 1
                continue
        i += 1
    for w in works:                                         # сегмент → реальный № пятна
        idx = w["block"] - 1
        w["plot"] = int(plots[idx][0]) if idx < len(plots) else w["block"]
        w["ochered"] = int(plots[idx][1]) if idx < len(plots) else None
    return works


def plan(key, t=None, horizon_days=180):
    """Что заказать заранее по объекту: работа ещё не закрыта (факт<100) и стартует
    в горизонте; заказать-до = старт − lead. Берём только работы с материалами."""
    t = t or today()
    out = []
    for w in parse_object(key):
        if w["fact"] != 0 or not w["start"]:   # только НЕ начатые работы (материал ещё не заказан)
            continue
        mat, lead = material_for(w["work"])
        if not mat:
            continue
        order_by = w["start"] - timedelta(days=lead)
        slack = (order_by - t).days
        if slack > horizon_days:
            continue
        st = ("overdue" if slack < 0 else "now" if slack <= 7
              else "soon" if slack <= 30 else "plan")
        out.append({
            "block": w.get("plot", w["block"]), "ochered": w.get("ochered"),
            "work": w["work"], "material": mat, "lead": lead,
            "start": w["start"].isoformat(), "order_by": order_by.isoformat(),
            "slack": slack, "fact": w["fact"], "status": st})
    out.sort(key=lambda x: x["slack"])
    return out


def summary(key, t=None, horizon_days=180):
    from collections import Counter
    t = t or today()
    items = plan(key, t, horizon_days)
    by_status = Counter(i["status"] for i in items)
    om = Counter(i["order_by"][:7] for i in items)
    return {
        "object": OBJ_NAMES.get(key, key), "key": key, "today": t.isoformat(),
        "horizon_days": horizon_days, "total": len(items),
        "earliest": items[0]["order_by"] if items else None,
        "by_status": {k: by_status.get(k, 0) for k in ("overdue", "now", "soon", "plan")},
        "by_order_month": [{"month": m, "count": c} for m, c in sorted(om.items())],
        "items": items[:200],
    }


def summary_all(t=None, horizon_days=180):
    """Сводный план по всему портфелю (4 объекта) — для закупщика, ведущего всё."""
    from collections import Counter
    t = t or today()
    items, by_object = [], []
    for k in ("aura", "atmo", "aksai", "keruen"):
        pl = plan(k, t, horizon_days)
        for it in pl:
            items.append(dict(it, object=OBJ_NAMES.get(k, k), okey=k))
        by_object.append({
            "object": OBJ_NAMES.get(k, k), "key": k, "total": len(pl),
            "overdue": sum(1 for i in pl if i["status"] == "overdue"),
            "earliest": pl[0]["order_by"] if pl else None})
    items.sort(key=lambda x: x["slack"])
    by_status = Counter(i["status"] for i in items)
    om = Counter(i["order_by"][:7] for i in items)
    return {
        "object": "Все объекты", "key": "all", "today": t.isoformat(),
        "horizon_days": horizon_days, "total": len(items),
        "earliest": items[0]["order_by"] if items else None,
        "by_status": {k: by_status.get(k, 0) for k in ("overdue", "now", "soon", "plan")},
        "by_order_month": [{"month": m, "count": c} for m, c in sorted(om.items())],
        "by_object": by_object,
        "items": items[:300],
    }


if __name__ == "__main__":
    for key in ("aura", "atmo", "aksai", "keruen"):
        w = parse_object(key)
        s = summary(key)
        print(f"\n=== {OBJ_NAMES[key]} ({key}) ===")
        print(f"  работ распознано: {len(w)} · блоков: {max([x['block'] for x in w] or [0])}")
        print(f"  к заказу (горизонт 180д): {s['total']} · по статусу {s['by_status']}")
        print(f"  ближайший дедлайн: {s['earliest']}")
        for i in s["items"][:5]:
            print(f"    [{i['status']:7}] до {i['order_by']} (запас {i['slack']:+}д) · "
                  f"бл.{i['block']} · {i['work'][:34]:34} → {i['material']}")
