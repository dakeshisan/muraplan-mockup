"""Бот «Хранитель» @keeper_murabot — приёмка на пятне = ИСТОЧНИК «в срок».

Главная ось KPI ставится здесь, а НЕ самоотметкой снабженца. Приёмка с фото,
сверка объёма; «в срок» = материал на объекте не позже срока работы (work_uid).
"""
from . import db
from .model import on_time


def accept(con, request_id, qty_accepted, accepted_date, keeper, need_date, photo=True) -> dict:
    """Зафиксировать приёмку → посчитать «в срок» → записать receipt (заявка → 'arr')."""
    ot = on_time(need_date, accepted_date)
    db.add_receipt(con, request_id, qty_accepted, accepted_date, keeper, ot,
                   photo=1 if photo else 0)
    db.log(con, request_id, "keeper.accept",
           f"accepted={accepted_date} need={need_date} on_time={ot}")
    return {"on_time": ot}


def run_telegram():  # pragma: no cover — боевой запуск, нужен TELEGRAM_TOKEN_KEEPER (PM)
    import os
    from telegram.ext import Application, CommandHandler
    token = os.environ["TELEGRAM_TOKEN_KEEPER"]
    con = db.connect(os.environ.get("DB_PATH", "supply.sqlite3"))
    app = Application.builder().token(token).build()

    async def start(update, ctx):
        await update.message.reply_text(
            "Хранитель · приёмка. /accept id;объём;дата(ГГГГ-ММ-ДД)  (фото обязательно)")

    async def accept_cmd(update, ctx):
        try:
            rid, qty, day = " ".join(ctx.args).split(";")
        except ValueError:
            return await update.message.reply_text("Формат: id;объём;дата(ГГГГ-ММ-ДД)")
        row = con.execute("SELECT need_date FROM requests WHERE id=?", (int(rid),)).fetchone()
        if not row:
            return await update.message.reply_text("Заявка не найдена")
        res = accept(con, int(rid), qty, day, keeper=str(update.effective_user.id),
                     need_date=row["need_date"])
        await update.message.reply_text(
            f"Принято #{rid}. В срок: {'да' if res['on_time'] else 'нет'}.")

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("accept", accept_cmd))
    app.run_polling()
