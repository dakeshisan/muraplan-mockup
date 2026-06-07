"""SQLite-слой фермы (наблюдательный режим), персистентный.

Та же структура, что в labor_control_bot: заявки (Муравей → Bitrix sp178) и
приёмки (Хранитель = «в срок»). Хранит реальные даты и stage_since для живого SLA.
"""
import sqlite3
from .model import Request, now

SCHEMA = """
CREATE TABLE IF NOT EXISTS requests(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mat TEXT, qty TEXT, work TEXT, work_uid TEXT, plot INTEGER,
  need_date TEXT, lead INTEGER, stage TEXT, stage_since TEXT,
  abc TEXT, price TEXT, hold TEXT, srv INTEGER DEFAULT 0, win TEXT,
  created_at TEXT, bitrix_id TEXT);

CREATE TABLE IF NOT EXISTS receipts(
  id INTEGER PRIMARY KEY AUTOINCREMENT, request_id INTEGER, qty_accepted TEXT,
  accepted_date TEXT, keeper TEXT, on_time INTEGER, photo INTEGER DEFAULT 0, accepted_at TEXT);

CREATE TABLE IF NOT EXISTS events(
  id INTEGER PRIMARY KEY AUTOINCREMENT, request_id INTEGER, kind TEXT, payload TEXT, at TEXT);
"""


def connect(path: str = ":memory:") -> sqlite3.Connection:
    con = sqlite3.connect(path)
    con.row_factory = sqlite3.Row
    con.executescript(SCHEMA)
    return con


def add_request(con, r: Request, bitrix_id=None) -> int:
    cur = con.execute(
        """INSERT INTO requests(mat,qty,work,work_uid,plot,need_date,lead,stage,stage_since,
                                abc,price,hold,srv,win,created_at,bitrix_id)
           VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (r.mat, r.qty, r.work, r.work_uid, r.plot, r.need, r.lead, r.stage, r.stage_since,
         r.abc, r.price, r.hold, 1 if r.srv else 0, r.win,
         now().isoformat(timespec="seconds"), bitrix_id))
    con.commit()
    return cur.lastrowid


def row_to_request(row) -> Request:
    return Request(row["mat"], row["qty"], row["work"], row["work_uid"], row["plot"],
                   row["need_date"], row["lead"], row["stage"], row["stage_since"],
                   row["abc"], row["price"], row["hold"], bool(row["srv"]), row["win"], row["id"])


def all_requests(con):
    return [row_to_request(r) for r in con.execute("SELECT * FROM requests ORDER BY id")]


def get_request(con, rid):
    row = con.execute("SELECT * FROM requests WHERE id=?", (rid,)).fetchone()
    return row_to_request(row) if row else None


def advance_stage(con, rid, new_stage) -> None:
    con.execute("UPDATE requests SET stage=?, stage_since=? WHERE id=?",
                (new_stage, now().isoformat(timespec="seconds"), rid))
    con.commit()
    log(con, rid, "stage.move", new_stage)


def add_receipt(con, rid, qty, accepted_date, keeper, on_time, photo=1) -> int:
    cur = con.execute(
        """INSERT INTO receipts(request_id,qty_accepted,accepted_date,keeper,on_time,photo,accepted_at)
           VALUES(?,?,?,?,?,?,?)""",
        (rid, qty, accepted_date, keeper, 1 if on_time else 0, photo,
         now().isoformat(timespec="seconds")))
    con.execute("UPDATE requests SET stage='arr', stage_since=? WHERE id=?",
                (now().isoformat(timespec="seconds"), rid))
    con.commit()
    return cur.lastrowid


def all_receipts(con):
    return con.execute("SELECT * FROM receipts").fetchall()


def log(con, rid, kind, payload) -> None:
    con.execute("INSERT INTO events(request_id,kind,payload,at) VALUES(?,?,?,?)",
                (rid, kind, payload, now().isoformat(timespec="seconds")))
    con.commit()


def count_requests(con) -> int:
    return con.execute("SELECT COUNT(*) c FROM requests").fetchone()["c"]
