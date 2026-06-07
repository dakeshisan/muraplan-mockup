#!/usr/bin/env python3
"""Печёт СТАТИЧЕСКИЙ снимок снабженческих экранов для GitHub Pages.

Тянет данные с живого сервера (с Basic Auth), ВЫЧИЩАЕТ персональные данные
(заголовки заявок с именами поставщиков, маскирует субдомен Bitrix), копирует
HTML и подменяет fetch('/api/...') на чтение локального data/*.json. Workspace
(интерактивный, с записью) в снимок НЕ попадает — только просмотр.

    ATLAS_BASE=http://127.0.0.1:8770 ATLAS_USER=atlas ATLAS_PASS=… \
        python3 deploy/build_pages.py

Результат: supply/ (страницы) + supply/data/ (снимок JSON). Публикуется на Pages.
"""
import base64
import json
import os
import re
import urllib.request

BASE = os.environ.get("ATLAS_BASE", "http://127.0.0.1:8770")
USER = os.environ.get("ATLAS_USER", "atlas")
PASS = os.environ.get("ATLAS_PASS", "")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "supply_core")
OUT = os.path.join(ROOT, "supply")
DATA = os.path.join(OUT, "data")


def fetch(path):
    req = urllib.request.Request(BASE + path)
    if PASS:
        tok = base64.b64encode(f"{USER}:{PASS}".encode()).decode()
        req.add_header("Authorization", "Basic " + tok)
    return urllib.request.urlopen(req, timeout=120).read()


def fetch_json(path):
    return json.loads(fetch(path))


def normalize_zip(data):
    """Перепаковать zip (xlsx) с ФИКСИРОВАННЫМИ датами членов и порядком — байт-в-байт
    одинаково при одинаковом содержимом (иначе таймстампы zip плодят коммиты снимка)."""
    import io
    import zipfile
    src = zipfile.ZipFile(io.BytesIO(data))
    out = io.BytesIO()
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as dst:
        for name in sorted(src.namelist()):
            info = zipfile.ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            dst.writestr(info, src.read(name))
    return out.getvalue()


def write_json(name, obj):
    with open(os.path.join(DATA, name), "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False)


def mask_portal(d):
    if isinstance(d, dict) and d.get("portal"):
        d["portal"] = re.sub(r"//[^.]+\.", "//***.", d["portal"])  # amanat.bitrix24.kz → ***.bitrix24.kz
    return d


def main():
    os.makedirs(DATA, exist_ok=True)
    today = fetch_json("/api/today")
    snap_date = today.get("today", "")

    # — простые агрегаты (без заголовков/PII) —
    write_json("today.json", mask_portal(today))
    write_json("gaps.json", fetch_json("/api/bitrix/gaps"))
    write_json("cycle.json", mask_portal(fetch_json("/api/bitrix/cycle")))
    write_json("zakup-objects.json", fetch_json("/api/zakup/objects"))
    for o in ("all", "aura", "atmo", "aksai", "keruen"):
        write_json(f"gpr-{o}.json", fetch_json(f"/api/gpr/plan?obj={o}"))

    # — радар: МАСКИРУЕМ построчные заявки (заголовки = имена поставщиков → "№id"),
    #   убираем ссылку на Bitrix (раскрывает портал/id), маскируем портал —
    for v in ("payment", "closing"):
        d = fetch_json(f"/api/bitrix/radar?view={v}")
        rows = (d.get("rows") or [])[:40]
        for r in rows:
            r["title"] = "№" + str(r.get("id", ""))   # без заголовка-PII
            r["url"] = "#"                             # без ссылки на CRM
        d["rows"] = rows
        mask_portal(d)
        write_json(f"radar-{v}.json", d)

    # — выгрузка .xlsx как статический файл —
    with open(os.path.join(DATA, "atlas_zakup.xlsx"), "wb") as f:
        f.write(normalize_zip(fetch("/export/buylist.xlsx")))

    # — шим: подменяем API-фетчи на статический снимок —
    shim = (
        "<script>(function(){var orig=window.fetch.bind(window);"
        "window.fetch=function(u){var s=String(u).replace(location.origin,'');"
        "var p=s.split('?')[0],q=s.split('?')[1]||'';"
        "if(p==='/api/gpr/plan'){var o=(new URLSearchParams(q)).get('obj')||'aura';return orig('data/gpr-'+o+'.json');}"
        "if(p==='/api/bitrix/radar'){var v=(new URLSearchParams(q)).get('view')||'payment';return orig('data/radar-'+v+'.json');}"
        "var m={'/api/today':'data/today.json','/api/bitrix/gaps':'data/gaps.json',"
        "'/api/bitrix/cycle':'data/cycle.json','/api/zakup/objects':'data/zakup-objects.json'};"
        "if(m[p])return orig(m[p]);return orig(u);};})();</script>"
    )

    pages = ("today.html", "gaps.html", "zakup.html", "radar.html", "cycle.html")
    for pg in pages:
        with open(os.path.join(SRC, pg), encoding="utf-8") as f:
            html = f.read()
        html = html.replace("</head>", shim + "</head>", 1)
        # абсолютные ссылки → относительные статические
        html = re.sub(r'href="/(today|gaps|zakup|radar|cycle)(?:\?[^"]*)?"', r'href="\1.html"', html)
        html = html.replace('href="/workspace.html"', 'href="index.html"').replace('href="/"', 'href="index.html"')
        html = html.replace("/export/buylist.xlsx", "data/atlas_zakup.xlsx")
        html = html.replace("/export/buylist.csv", "data/atlas_zakup.xlsx")
        with open(os.path.join(OUT, pg), "w", encoding="utf-8") as f:
            f.write(html)

    with open(os.path.join(OUT, "index.html"), "w", encoding="utf-8") as f:
        f.write(INDEX.replace("{{DATE}}", snap_date))
    print(f"OK · снимок на {snap_date} · {len(pages)} страниц + data/ → {OUT}")


INDEX = """<!DOCTYPE html><html lang="ru" style="color-scheme:light"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#284157"><title>ATLAS · Снабжение — снимок</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant:wght@600;700&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
:root{--bg:#F7F5EE;--card:#FBFBFB;--ink:#1E1E1E;--mut:#6E6E6E;--faint:#9C9486;--line:#E0DDD3;--accent:#007484;--gold:#CFB372;--gold-soft:#EFE6CD;--gold-ink:#7A5E1E;--navy:#284157}
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Jost',-apple-system,'Segoe UI',sans-serif;background:var(--bg);color:var(--ink);font-size:14px;line-height:1.55}
.top{background:var(--navy);color:#fff}.top .row{max-width:920px;margin:0 auto;padding:20px 26px;display:flex;align-items:center;gap:14px}
.lg{width:40px;height:40px;border-radius:10px;background:var(--gold);display:flex;align-items:center;justify-content:center}
.nm{font-family:'Cormorant',Georgia,serif;font-weight:700;font-size:25px;line-height:1}.sb{font-size:12px;color:#A9BBC9;margin-top:3px}
.wrap{max-width:920px;margin:0 auto;padding:26px}
.note{font-size:12.5px;color:#8a6420;background:var(--gold-soft);border:1px solid #e2d2a6;border-radius:11px;padding:11px 15px;margin-bottom:22px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
a.card{display:block;background:var(--card);border:1px solid var(--line);border-radius:15px;padding:18px 20px;text-decoration:none;color:inherit;border-left:3px solid var(--accent)}
a.card:hover{border-color:var(--ink)}a.card.g{border-left-color:var(--gold)}
.card h3{font-family:'Cormorant',Georgia,serif;font-size:21px;font-weight:700;margin-bottom:4px}.card p{font-size:12.5px;color:var(--mut)}
.foot{margin-top:24px;font-size:12px;color:var(--faint);line-height:1.6}
</style></head><body>
<div class="top"><div class="row">
<div class="lg"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#284157" stroke-width="2" stroke-linejoin="round"><path d="M3 7.5l9-4.5 9 4.5v9l-9 4.5-9-4.5v-9z"/><path d="M3 7.5l9 4.5 9-4.5M12 12v9"/></svg></div>
<div><div class="nm">ATLAS · Снабжение</div><div class="sb">статический снимок · срез на {{DATE}} · только просмотр</div></div>
</div></div>
<div class="wrap">
<div class="note">● Это <b>публичный статический снимок</b> на {{DATE}} (данные не обновляются вживую). Персональные данные вычищены: заголовки заявок и имена поставщиков не публикуются, субдомен Bitrix замаскирован. Живой рабочий инструмент с заявками и приёмкой — отдельно, под паролем.</div>
<div class="grid">
<a class="card g" href="today.html"><h3>Сводка дня</h3><p>Что горит сегодня: оплата, просрочка, не подано, заказать на неделе</p></a>
<a class="card" href="gaps.html"><h3>Не подано?</h3><p>План ГПР × заявки: где материал нужен, а заявки не видно</p></a>
<a class="card" href="zakup.html"><h3>План закупа</h3><p>Предиктив по ГПР всех объектов — что заказать заранее</p></a>
<a class="card" href="radar.html"><h3>Оплата-радар</h3><p>Узкое место оплаты в воронке Bitrix (агрегаты)</p></a>
<a class="card" href="cycle.html"><h3>Цикл закупа</h3><p>Где в воронке теряются дни</p></a>
</div>
<div class="foot">ATAMURA GROUP · ATLAS · Снабжение. Снимок собран из воронки #178/4 (только чтение) и отчётов ГПР. Даты «заказать-до» — оценки сроков поставки.</div>
</div></body></html>"""


if __name__ == "__main__":
    main()
