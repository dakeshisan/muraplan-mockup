#!/usr/bin/env bash
# Включить АВТО-ОБНОВЛЕНИЕ снимка GitHub Pages по расписанию (launchd).
# Снимок остаётся доступным 24/7 на Pages даже когда Мак выключен; данные
# освежаются в 09:00 / 14:00 / 19:00, когда Мак включён и сервер-источник жив.
#
#   bash deploy/setup-pages-auto.sh         # включить/обновить расписание
#   bash deploy/setup-pages-auto.sh off     # выключить
#   launchctl kickstart gui/$(id -u)/com.atlas.pages-refresh   # обновить сейчас
set -euo pipefail
REPO="/Users/bakylichkakamshybaeva/Documents/Claude/muraplan-mockup"
CLONE="$HOME/.atlas-supply/repo"
LA="$HOME/Library/LaunchAgents"
UIDN="$(id -u)"
KEY="$HOME/.ssh/sales_companion_ed25519"
GITSSH="ssh -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"
cd "$REPO"

if [ "${1:-on}" = "off" ]; then
  launchctl bootout "gui/$UIDN/com.atlas.pages-refresh" 2>/dev/null || true
  echo "Авто-обновление выключено."; exit 0
fi

PASS="$(grep '^ATLAS_PASS=' supply_core/.env 2>/dev/null | cut -d= -f2- || true)"
[ -n "$PASS" ] || { echo "Нет ATLAS_PASS в supply_core/.env — сначала: bash deploy/serve-mac.sh"; exit 1; }

# клон вне ~/Documents (git под launchd: TCC не пускает в ~/Documents)
if [ -d "$CLONE/.git" ]; then
  GIT_SSH_COMMAND="$GITSSH" git -C "$CLONE" fetch origin -q && git -C "$CLONE" reset --hard origin/main -q
else
  mkdir -p "$(dirname "$CLONE")"
  GIT_SSH_COMMAND="$GITSSH" git clone -q git@github.com:dakeshisan/muraplan-mockup.git "$CLONE"
fi

mkdir -p "$LA" "$HOME/.atlas-supply"
cat > "$LA/com.atlas.pages-refresh.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.atlas.pages-refresh</string>
  <key>ProgramArguments</key><array><string>/bin/bash</string><string>$CLONE/deploy/refresh-pages.sh</string></array>
  <key>EnvironmentVariables</key><dict>
    <key>PATH</key><string>/usr/bin:/bin</string>
    <key>ATLAS_USER</key><string>atlas</string>
    <key>ATLAS_PASS</key><string>$PASS</string>
    <key>ATLAS_BASE</key><string>http://127.0.0.1:8770</string>
  </dict>
  <key>StartCalendarInterval</key><array>
    <dict><key>Hour</key><integer>9</integer><key>Minute</key><integer>0</integer></dict>
    <dict><key>Hour</key><integer>14</integer><key>Minute</key><integer>0</integer></dict>
    <dict><key>Hour</key><integer>19</integer><key>Minute</key><integer>0</integer></dict>
  </array>
  <key>StandardOutPath</key><string>$HOME/.atlas-supply/refresh.log</string>
  <key>StandardErrorPath</key><string>$HOME/.atlas-supply/refresh.log</string>
</dict></plist>
PLIST

launchctl bootout "gui/$UIDN/com.atlas.pages-refresh" 2>/dev/null || true
launchctl bootstrap "gui/$UIDN" "$LA/com.atlas.pages-refresh.plist"
echo "✓ Авто-обновление снимка: 09:00 / 14:00 / 19:00 ежедневно."
echo "  Обновить прямо сейчас:  launchctl kickstart gui/$UIDN/com.atlas.pages-refresh"
echo "  Лог:                    ~/.atlas-supply/refresh.log"
