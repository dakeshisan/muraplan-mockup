"""ATLAS · Снабжение — ядро модели (single source of truth).

Зеркалит логику мокапа `atlas_supply_roles_brand.html`, но на РЕАЛЬНЫХ датах:
крайний срок заявки, запас/просрочка по сроку работы, риск, SLA обработки заявки
(в реальном времени от `stage_since`) и «в срок» по приёмке Хранителя.

Наблюдательный режим — KPI считается, на премию НЕ влияет (Фаза 2).
Главная ось: «комплектный приём фронта по ХРАНИТЕЛЮ» (не самоотметка).
Экономия к смете НЕ премируется. Один work_uid — один виновник.

«Сегодня»/«сейчас» берутся из env (SUPPLY_TODAY / SUPPLY_NOW) или системных часов —
поэтому дедлайны и SLA считаются в реальном времени для живого рабочего пространства.
"""
import os
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from typing import Optional

SLA = {"req": 3, "pay": 4}          # норматив обработки стадии, дн
RANK = {"srv": 0, "over": 1, "hold": 1, "late": 2, "risk": 3,
        "transit": 4, "ok": 5, "done": 9}


def today() -> date:
    v = os.environ.get("SUPPLY_TODAY")
    return datetime.strptime(v, "%Y-%m-%d").date() if v else date.today()


def now() -> datetime:
    v = os.environ.get("SUPPLY_NOW")
    return datetime.fromisoformat(v) if v else datetime.now()


def _d(v) -> date:
    return datetime.strptime(v, "%Y-%m-%d").date() if isinstance(v, str) else v


@dataclass
class Request:
    mat: str
    qty: str
    work: str
    work_uid: str          # ← мост «материал → срок работы»
    plot: int
    need: str              # ISO дата срока работы (из ГПР), immutable
    lead: int              # срок поставки, дн (из справочника/сметы)
    stage: str             # req | pay | arr
    stage_since: str       # ISO datetime входа в стадию (для SLA в реальном времени)
    abc: str = "B"
    price: str = "ok"      # ok | over — цена vs эталон (ГЕЙТ допуска, не премия)
    hold: Optional[str] = None
    srv: bool = False
    win: str = ""
    id: Optional[int] = None


def order_by(r: Request) -> date:
    """Крайний срок заявки/заказа: материал успеет к старту работ."""
    return _d(r.need) - timedelta(days=r.lead)


def slack(r: Request, t: Optional[date] = None) -> int:
    """Запас (дн) до крайнего срока. Отрицательный = уже поздно заказывать."""
    return (order_by(r) - (t or today())).days


def aged(r: Request, ts: Optional[datetime] = None) -> int:
    """Сколько дней заявка в текущей стадии (реальное время)."""
    try:
        since = datetime.fromisoformat(r.stage_since)
    except (ValueError, TypeError):
        return 0
    return max(0, ((ts or now()) - since).days)


def aged_breach(r: Request, ts: Optional[datetime] = None) -> bool:
    """Обработка заявки просрочена против SLA стадии."""
    return r.stage != "arr" and aged(r, ts) > SLA.get(r.stage, 99)


def risk(r: Request, t: Optional[date] = None):
    """(код, подпись, ранг) — что это и насколько горит. Зеркало мокапа."""
    t = t or today()
    if r.stage == "arr":
        return ("done", "на объекте", RANK["done"])
    if r.srv or "срыв" in r.win:
        return ("srv", "срыв → стоп фронта", RANK["srv"])
    if r.hold:
        return ("hold", f"ждёт ТЗ · {r.hold}", RANK["hold"])
    if r.stage == "pay":
        if "риск" in r.win:
            return ("late", "доставка с риском", RANK["late"])
        return ("transit", "в пути · в окне", RANK["transit"])
    s = slack(r, t)
    ob = order_by(r).strftime("%d.%m")
    if s < 0:
        return ("over", f"просрочка заказа {-s} дн", RANK["over"])
    if s <= 2:
        return ("risk", f"заказать срочно · до {ob}", RANK["risk"])
    return ("ok", f"заказать до {ob} · запас {s} дн", RANK["ok"])


def on_time(need, accepted) -> bool:
    """«В срок» по Хранителю: материал на объекте не позже срока работы.

    Источник главной оси KPI — ставит ХРАНИТЕЛЬ при приёмке, не снабженец.
    """
    return accepted is not None and _d(accepted) <= _d(need)
