#!/usr/bin/env bash
# ATLAS · Снабжение — поднять ОНЛАЙН: локальный сервер + защищённый туннель.
#
# Запускает рабочее пространство снабженца и пробрасывает его наружу через
# Cloudflare Quick Tunnel (HTTPS, без аккаунта). Доступ закрыт HTTP Basic Auth —
# логин/пароль берутся из supply_core/.env (ATLAS_USER / ATLAS_PASS).
# Bitrix-токен НИКУДА не уходит: остаётся в .env на этой машине.
#
#   bash deploy/serve-online.sh
#
# Внимание: туннель живёт, пока включён этот компьютер и крутятся оба процесса.
# Для постоянного онлайна (24/7, свой домен) — деплой на VPS (см. docs/deploy.md).
set -euo pipefail
cd "$(dirname "$0")/.."

export PORT="${PORT:-8770}"
export DB_PATH="${DB_PATH:-$HOME/.atlas_supply.sqlite3}"
# SUPPLY_TODAY не задаём → берётся реальная сегодняшняя дата
command -v cloudflared >/dev/null || { echo "Нет cloudflared. Установите: https://github.com/cloudflare/cloudflared"; exit 1; }
grep -q "^ATLAS_PASS=" supply_core/.env 2>/dev/null || { echo "Нет ATLAS_PASS в supply_core/.env — задайте пароль для онлайн-доступа."; exit 1; }

echo "→ старт сервера на :$PORT …"
pkill -f supply_core.server 2>/dev/null || true; sleep 1
nohup python3 -m supply_core.server >/tmp/atlas_server.log 2>&1 &
sleep 3
curl -s -m 5 -o /dev/null "http://127.0.0.1:$PORT/api/zakup/objects" || { echo "Сервер не поднялся, см. /tmp/atlas_server.log"; exit 1; }

echo "→ старт туннеля …"
pkill -f "cloudflared tunnel" 2>/dev/null || true; sleep 1
nohup cloudflared tunnel --url "http://localhost:$PORT" --no-autoupdate >/tmp/atlas_tunnel.log 2>&1 &

URL=""
for _ in $(seq 1 25); do
  URL=$(grep -oE "https://[a-z0-9-]+\.trycloudflare\.com" /tmp/atlas_tunnel.log | head -1 || true)
  [ -n "$URL" ] && break
  sleep 1
done

USER_=$(grep "^ATLAS_USER=" supply_core/.env | cut -d= -f2-)
echo "──────────────────────────────────────────────"
echo " ATLAS · Снабжение — ОНЛАЙН"
echo " Ссылка: ${URL:-<не появилась, см. /tmp/atlas_tunnel.log>}/today"
echo " Логин:  ${USER_:-atlas}"
echo " Пароль: см. supply_core/.env (ATLAS_PASS)"
echo "──────────────────────────────────────────────"
