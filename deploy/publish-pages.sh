#!/usr/bin/env bash
# Пересобрать СТАТИЧЕСКИЙ снимок из живых данных и опубликовать на GitHub Pages.
# Нужен запущенный локальный сервер (источник данных) — см. deploy/serve-online.sh
# или просто `python3 -m supply_core.server`.
#
#   bash deploy/publish-pages.sh
#
# Результат: https://dakeshisan.github.io/muraplan-mockup/supply/
set -euo pipefail
cd "$(dirname "$0")/.."

ATLAS_USER=$(grep "^ATLAS_USER=" supply_core/.env 2>/dev/null | cut -d= -f2- || echo atlas)
ATLAS_PASS=$(grep "^ATLAS_PASS=" supply_core/.env 2>/dev/null | cut -d= -f2- || echo "")
BASE="${ATLAS_BASE:-http://127.0.0.1:8770}"
export ATLAS_USER ATLAS_PASS ATLAS_BASE="$BASE"

curl -s -m 8 -o /dev/null -u "$ATLAS_USER:$ATLAS_PASS" "$BASE/api/zakup/objects" \
  || { echo "Сервер не отвечает на $BASE — запустите python3 -m supply_core.server"; exit 1; }

echo "→ пересобираю снимок …"
python3 deploy/build_pages.py

git add supply
if git diff --cached --quiet; then echo "Снимок не изменился — публиковать нечего."; exit 0; fi
git commit -q -m "Снабжение: обновить снимок Pages"
GIT_SSH_COMMAND="ssh -i ~/.ssh/sales_companion_ed25519 -o IdentitiesOnly=yes" \
  git push git@github.com:dakeshisan/muraplan-mockup.git main
echo "✓ Опубликовано → https://dakeshisan.github.io/muraplan-mockup/supply/"
