# ATLAS · Снабжение — как вынести панели на внутренний сервер

Сейчас `/radar` и `/zakup` живут только на машине, где запущен `python3 -m supply_core.server`.
Чтобы руководство открывало по ссылке (как Bitrix), подними на любом внутреннем
Linux/Mac-сервере (Python 3.9+, без зависимостей для UI; `xlrd`/`PyMuPDF` нужны только
для смет/ГПР).

## Запуск на сервере (доступ по локальной сети)
```bash
cd muraplan-mockup
HOST=0.0.0.0 PORT=8770 BITRIX_WEBHOOK="https://amanat.bitrix24.kz/rest/<uid>/<token>/" \
  python3 -m supply_core.server
```
→ коллеги в сети откроют `http://<ip-сервера>:8770/radar` и `/zakup`.

## Как демон (systemd, Linux)
`/etc/systemd/system/atlas-supply.service`:
```ini
[Unit]
Description=ATLAS Supply panels
[Service]
WorkingDirectory=/opt/muraplan-mockup
Environment=HOST=0.0.0.0
Environment=PORT=8770
Environment=BITRIX_WEBHOOK=https://amanat.bitrix24.kz/rest/<uid>/<token>/
Environment=GPR_DIR=/opt/atlas-data/gpr_pdf
ExecStart=/usr/bin/python3 -m supply_core.server
Restart=always
[Install]
WantedBy=multi-user.target
```
`sudo systemctl enable --now atlas-supply` · логи `journalctl -u atlas-supply -f`.

## Данные на сервере
- Вебхук Bitrix — только в env (`BITRIX_WEBHOOK`), НЕ в коде/репо. Сразу за reverse-proxy с HTTPS.
- ГПР-PDF и сметы — положить в каталог и указать `GPR_DIR` / `AURA_XLSX`.
- Кэши (радар 5 мин, план 10 мин) греются на старте; PDF/CRM не дёргаются на каждый запрос.

## Безопасно
Панели **read-only** к Bitrix. Записи (Муравей) — отдельно, по явному включению (live=True).
Перед публикацией в сеть — за VPN/прокси с авторизацией: данные внутренние.
