#!/usr/bin/env bash
# scripts/check-colors.sh — no raw hex or rgb()/rgba() colours in src/.
# Colours come from named variables (tokens.css, global.css). The vendored
# tokens and the Markdown content are excluded. Prints each match and exits 1
# when there are any; shared by scripts/verify.sh and .github/workflows/ci.yml.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

MATCHES="$(grep -rnE '#[0-9a-fA-F]{3,8}\b|rgba?\(' src \
  --include='*.astro' --include='*.css' --include='*.ts' 2>/dev/null \
  | grep -v '^src/styles/vendor/' \
  | grep -v '^src/content/')"

if [ -n "$MATCHES" ]; then
  echo "$MATCHES"
  echo "COLORS: FAIL"
  exit 1
fi
echo "COLORS: PASS"
