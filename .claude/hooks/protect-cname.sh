#!/bin/sh
# PreToolUse guard: see protect_cname.py for the rules.
# Runs the python guard when available; otherwise falls back to a minimal
# grep check that protects direct file-tool writes only.
dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PY=$(command -v python3 2>/dev/null || command -v python 2>/dev/null)

if [ -n "$PY" ]; then
  exec "$PY" "$dir/protect_cname.py"
fi

input=$(cat)
if printf '%s' "$input" | grep -Eq '"(file_path|notebook_path)"[[:space:]]*:[[:space:]]*"[^"]*CNAME"'; then
  echo "BLOCKED: CNAME holds the custom-domain binding for atlas.atamuragroup.kz. Do not edit, overwrite or delete it." >&2
  exit 2
fi
exit 0
