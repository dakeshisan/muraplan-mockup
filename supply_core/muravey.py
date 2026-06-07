"""Бот «Муравей» @muravey_murabot — заявки снабженца → БД → Bitrix sp178.

Ядро в submit_request() (работает без Telegram). Telegram-слой
(python-telegram-bot==21.11.1) — тонкая обёртка, запускается боевым токеном от PM.
"""
from . import db
from .model import Request, now
from .bitrix import Bitrix


def submit_request(con, bitrix: Bitrix, r: Request) -> int:
    """Принять заявку: записать в БД и отправить в Bitrix sp178."""
    bx_id = bitrix.create_sp178({
        "mat": r.mat, "qty": r.qty, "work_uid": r.work_uid,
        "need": r.need, "plot": r.plot, "abc": r.abc, "stage": r.stage,
    })
    rid = db.add_request(con, r, bitrix_id=bx_id)
    db.log(con, rid, "muravey.submit", f"bitrix={bx_id} stage={r.stage}")
    return rid


def run_telegram():  # pragma: no cover — боевой запуск, нужен TELEGRAM_TOKEN_MURAVEY (PM)
    import os
    from telegram.ext import Application, CommandHandler
    token = os.environ["TELEGRAM_TOKEN_MURAVEY"]
    con = db.connect(os.environ.get("DB_PATH", "supply.sqlite3"))
    bitrix = Bitrix(os.environ.get("BITRIX_WEBHOOK"))
    app = Application.builder().token(token).build()

    async def start(update, ctx):
        await update.message.reply_text(
            "Муравей · заявки. /new материал;объём;work_uid;пятно;срок(ГГГГ-ММ-ДД);lead")

    async def new(update, ctx):
        try:
            mat, qty, wuid, plot, need, lead = " ".join(ctx.args).split(";")
        except ValueError:
            return await update.message.reply_text(
                "Формат: материал;объём;work_uid;пятно;срок(ГГГГ-ММ-ДД);lead")
        r = Request(mat, qty, mat, wuid, int(plot), need, int(lead), "req",
                    now().isoformat(timespec="seconds"))
        rid = submit_request(con, bitrix, r)
        await update.message.reply_text(f"Заявка #{rid} → Bitrix sp178. Слежу за сроком.")

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("new", new))
    app.run_polling()
