#!/usr/bin/env bash
# ДЕПЛОЙ НА MAC: сервер ATLAS·Снабжение + Cloudflare-туннель как сервисы launchd —
# автозапуск при входе, авто-перезапуск при падении, переживает перезагрузку.
#
#   bash deploy/serve-mac.sh           # поставить/обновить копию и запустить
#   bash deploy/serve-mac.sh stop      # остановить сервисы
#   bash deploy/serve-mac.sh url       # текущий публичный адрес
#
# ВАЖНО: launchd НЕ читает ~/Documents (TCC-защита macOS), поэтому код и ГПР-PDF
# КОПИРУЮТСЯ в ~/.atlas-supply/ и сервис крутится оттуда. Запускайте скрипт после
# изменений кода/данных, чтобы обновить копию. Живо, пока Мак включён и вы вошли.
set -euo pipefail
REPO="/Users/bakylichkakamshybaeva/Documents/Claude/muraplan-mockup"
DATADIR="$HOME/.atlas-supply"
APPDIR="$DATADIR/app"
GPRDIR="$DATADIR/gpr_pdf"
LA="$HOME/Library/LaunchAgents"
PY="$(command -v python3)"
CF="$(command -v cloudflared || true)"
UIDN="$(id -u)"
cd "$REPO"

url(){ grep -oE "https://[a-z0-9-]+\.trycloudflare\.com" "$DATADIR/tunnel.log" 2>/dev/null | tail -1; }
stop(){
  launchctl bootout "gui/$UIDN/com.atlas.tunnel" 2>/dev/null || true
  launchctl bootout "gui/$UIDN/com.atlas.supply" 2>/dev/null || true
  echo "Остановлено."
}
case "${1:-up}" in
  stop) stop; exit 0 ;;
  url)  U="$(url)"; echo "${U:-нет (см. $DATADIR/tunnel.log)}"; exit 0 ;;
esac

mkdir -p "$DATADIR" "$APPDIR" "$GPRDIR" "$LA"

# пароль: из .env → /tmp → генерим; фиксируем в .env (gitignored)
PASS="$(grep "^ATLAS_PASS=" supply_core/.env 2>/dev/null | cut -d= -f2- || true)"
[ -z "$PASS" ] && PASS="$(cat /tmp/atlas_pass.txt 2>/dev/null || true)"
[ -z "$PASS" ] && PASS="mura-$(openssl rand -hex 4)"
grep -q "^ATLAS_USER=" supply_core/.env 2>/dev/null || echo "ATLAS_USER=atlas" >> supply_core/.env
grep -q "^ATLAS_PASS=" supply_core/.env 2>/dev/null || echo "ATLAS_PASS=$PASS" >> supply_core/.env

# КОПИЯ кода + ГПР-данных в НЕ-TCC-папку (launchd-сервис читает только отсюда)
rsync -a --delete --exclude '*.sqlite3' --exclude '__pycache__' "$REPO/supply_core/" "$APPDIR/supply_core/"
cp -f "$HOME/Documents/Claude/gpr_pdf/"*.pdf "$GPRDIR/" 2>/dev/null || true

cat > "$LA/com.atlas.supply.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.atlas.supply</string>
  <key>ProgramArguments</key><array>
    <string>$PY</string><string>-c</string>
    <string>import sys; sys.path.insert(0, '$APPDIR'); from supply_core.server import main; main()</string>
  </array>
  <key>EnvironmentVariables</key><dict>
    <key>PORT</key><string>8770</string>
    <key>DB_PATH</key><string>$DATADIR/supply.sqlite3</string>
    <key>GPR_DIR</key><string>$GPRDIR</string>
    <key>ATLAS_USER</key><string>atlas</string>
    <key>ATLAS_PASS</key><string>$PASS</string>
    <key>PYTHONUNBUFFERED</key><string>1</string>
  </dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>$DATADIR/server.log</string>
  <key>StandardErrorPath</key><string>$DATADIR/server.log</string>
</dict></plist>
PLIST

if [ -n "$CF" ]; then
cat > "$LA/com.atlas.tunnel.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.atlas.tunnel</string>
  <key>ProgramArguments</key><array><string>$CF</string><string>tunnel</string><string>--no-autoupdate</string><string>--url</string><string>http://localhost:8770</string></array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>$DATADIR/tunnel.log</string>
  <key>StandardErrorPath</key><string>$DATADIR/tunnel.log</string>
</dict></plist>
PLIST
fi

pkill -f "supply_core.server" 2>/dev/null || true
: > "$DATADIR/tunnel.log" 2>/dev/null || true
: > "$DATADIR/server.log" 2>/dev/null || true
stop; sleep 1
launchctl bootstrap "gui/$UIDN" "$LA/com.atlas.supply.plist"
[ -n "$CF" ] && launchctl bootstrap "gui/$UIDN" "$LA/com.atlas.tunnel.plist"

echo "→ сервер: launchd com.atlas.supply (копия в $APPDIR, авто-рестарт)"
sleep 9
U="$(url)"
echo "──────────────────────────────────────────────"
echo " ОНЛАЙН:  ${U:-поднимается, повторите: bash deploy/serve-mac.sh url}"
echo " ЛОГИН:   atlas / $PASS"
echo "──────────────────────────────────────────────"
