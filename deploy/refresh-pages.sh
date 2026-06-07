#!/usr/bin/env bash
# АВТО-ОБНОВЛЕНИЕ снимка GitHub Pages из живого сервера.
# Запускается launchd-агентом com.atlas.pages-refresh ИЗ КЛОНА вне ~/Documents
# (git-операции в ~/Documents под launchd блокирует TCC). Всегда стартует с
# origin/main → push всегда fast-forward, без конфликтов с правками из ~/Documents.
#
# Нужны в env (ставит агент): ATLAS_PASS [, ATLAS_USER, ATLAS_BASE].
set -euo pipefail
SELF="$(cd "$(dirname "$0")/.." && pwd)"     # корень этого клона
cd "$SELF"

KEY="$HOME/.ssh/sales_companion_ed25519"
export GIT_SSH_COMMAND="ssh -i $KEY -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new"
export ATLAS_BASE="${ATLAS_BASE:-http://127.0.0.1:8770}"
export ATLAS_USER="${ATLAS_USER:-atlas}"

# источник данных должен отвечать
curl -s -m 8 -o /dev/null -u "$ATLAS_USER:${ATLAS_PASS:-}" "$ATLAS_BASE/api/zakup/objects" \
  || { echo "$(date '+%F %T') источник $ATLAS_BASE недоступен — пропуск"; exit 0; }

git fetch origin main -q
git reset --hard origin/main -q
python3 deploy/build_pages.py
git add supply
if git diff --cached --quiet; then echo "$(date '+%F %T') снимок не изменился"; exit 0; fi
git -c user.email="ops@atamura" -c user.name="ATLAS auto" commit -q -m "auto: обновление снимка Pages"
git push origin main -q
echo "$(date '+%F %T') опубликовано → https://dakeshisan.github.io/muraplan-mockup/supply/"
