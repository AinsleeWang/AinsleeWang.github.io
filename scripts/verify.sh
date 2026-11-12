#!/usr/bin/env bash
# scripts/verify.sh — single entry point for CI / verifier agents.
# Runs typecheck, build, color audit, raw-color grep, and route screenshots;
# prints a one-line summary at the end. Only summaries are echoed to stdout —
# full logs land in .evidence/<milestone>/.
#
# Env vars:
#   MILESTONE=<name>   default "adhoc" — evidence subfolder name
#   ROUTES=/,/foo      default "/"     — comma-separated routes to screenshot
#   SHOOT_SCRIPT=path  default: scripts/shoot.mjs (Playwright, system Chrome)

set -uo pipefail

SITE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SITE_ROOT"

MILESTONE="${MILESTONE:-adhoc}"
ROUTES="${ROUTES:-/}"
DS_REPO="$SITE_ROOT/../wit-et-design-system"
SHOOT_SCRIPT="${SHOOT_SCRIPT:-$SITE_ROOT/scripts/shoot.mjs}"

LOG_DIR="$SITE_ROOT/.evidence/$MILESTONE"
mkdir -p "$LOG_DIR"

FAILS=()

echo "== verify.sh: milestone=$MILESTONE routes=$ROUTES =="

# 1. astro check
npm run check > "$LOG_DIR/check.log" 2>&1
CHECK_EXIT=$?
echo "CHECK exit=$CHECK_EXIT (log: $LOG_DIR/check.log)"
[ "$CHECK_EXIT" -ne 0 ] && FAILS+=("check")

# 2. astro build
# The content layer caches rendered Markdown and does not invalidate it when
# remark/rehype plugins change, so always build from a clean cache.
rm -rf "$SITE_ROOT/.astro" "$SITE_ROOT/node_modules/.astro"
npm run build > "$LOG_DIR/build.log" 2>&1
BUILD_EXIT=$?
echo "BUILD exit=$BUILD_EXIT (log: $LOG_DIR/build.log)"
[ "$BUILD_EXIT" -ne 0 ] && FAILS+=("build")

# 3. color audit — concat dist html+css into one file first, because
# color_audit.py FAILs a single file with no var(--*) in it, and Astro
# splits CSS out to its own files per-page.
if [ "$BUILD_EXIT" -eq 0 ]; then
  COMBINED="$LOG_DIR/color-audit-combined.txt"
  : > "$COMBINED"
  find dist -type f \( -name '*.html' -o -name '*.css' \) -exec cat {} + >> "$COMBINED" 2>/dev/null
  python3 "$DS_REPO/qa/color_audit.py" "$COMBINED" > "$LOG_DIR/color-audit.log" 2>&1
  COLOR_EXIT=$?
  echo "COLOR_AUDIT exit=$COLOR_EXIT (log: $LOG_DIR/color-audit.log)"
  [ "$COLOR_EXIT" -ne 0 ] && FAILS+=("color-audit")
else
  echo "COLOR_AUDIT exit=skipped (build failed)"
  FAILS+=("color-audit-skipped-build-failed")
fi

# 4. raw hex / rgba() grep in src, excluding vendor (upstream-sourced) and
# content (markdown body text, not CSS).
GREP_OUT="$LOG_DIR/raw-color-grep.log"
grep -rnE '#[0-9a-fA-F]{3,8}\b|rgba?\(' src \
  --include='*.astro' --include='*.css' --include='*.ts' 2>/dev/null \
  | grep -v '^src/styles/vendor/' \
  | grep -v '^src/content/' \
  > "$GREP_OUT"
if [ -s "$GREP_OUT" ]; then
  echo "RAW_COLOR_GREP exit=1 (log: $GREP_OUT)"
  FAILS+=("raw-color-grep")
else
  echo "RAW_COLOR_GREP exit=0"
fi

# 5. internal link check — every href/src in dist/ resolves to a real file
# (see scripts/check-links.mjs's own ALLOWLIST for the two known-404 E-1.4
# routes it deliberately skips).
if [ "$BUILD_EXIT" -eq 0 ]; then
  node "$SITE_ROOT/scripts/check-links.mjs" "$SITE_ROOT/dist" > "$LOG_DIR/check-links.log" 2>&1
  LINKS_EXIT=$?
  cat "$LOG_DIR/check-links.log"
  echo "LINKS exit=$LINKS_EXIT (log: $LOG_DIR/check-links.log)"
  [ "$LINKS_EXIT" -ne 0 ] && FAILS+=("links")
else
  echo "LINKS exit=skipped (build failed)"
  FAILS+=("links-skipped-build-failed")
fi

# 6. screenshots — start preview, shoot each route at 375/768/1280, check for
# horizontal overflow, stop preview.
PREVIEW_PID=""
cleanup() {
  if [ -n "$PREVIEW_PID" ]; then
    kill "$PREVIEW_PID" 2>/dev/null || true
    wait "$PREVIEW_PID" 2>/dev/null || true
  fi
  # npx forks the real server as a child, so killing the wrapper PID can
  # leave it listening; ask astro to stop it as well.
  npx astro preview stop > /dev/null 2>&1 || true
}
trap cleanup EXIT

if [ "$BUILD_EXIT" -ne 0 ]; then
  echo "SCREENSHOT exit=skipped (build failed)"
  FAILS+=("screenshot-skipped-build-failed")
else
  npx astro preview --port 4321 > "$LOG_DIR/preview.log" 2>&1 &
  PREVIEW_PID=$!

  READY=0
  for i in $(seq 1 30); do
    if curl -sf "http://localhost:4321/" > /dev/null 2>&1; then
      READY=1
      break
    fi
    sleep 1
  done

  if [ "$READY" -ne 1 ]; then
    echo "SCREENSHOT exit=1 (preview server did not start, see $LOG_DIR/preview.log)"
    FAILS+=("screenshot-server-not-ready")
  else
    OVERFLOW_FAIL=0
    IFS=',' read -ra ROUTE_ARR <<< "$ROUTES"
    for ROUTE in "${ROUTE_ARR[@]}"; do
      SLUG="$(echo "$ROUTE" | sed 's:^/::; s:/$::; s:/:-:g')"
      [ -z "$SLUG" ] && SLUG="home"
      OUT_PREFIX="$LOG_DIR/$SLUG"
      SHOOT_LOG="$LOG_DIR/shoot-$SLUG.log"
      node "$SHOOT_SCRIPT" "http://localhost:4321${ROUTE}" "$OUT_PREFIX" "375,768,1280" > "$SHOOT_LOG" 2>&1
      SHOOT_EXIT=$?
      cat "$SHOOT_LOG"
      if [ "$SHOOT_EXIT" -ne 0 ]; then
        OVERFLOW_FAIL=1
      elif grep -E 'horizontalOverflow=' "$SHOOT_LOG" | grep -vq 'horizontalOverflow=0px'; then
        OVERFLOW_FAIL=1
      fi
    done
    if [ "$OVERFLOW_FAIL" -ne 0 ]; then
      echo "SCREENSHOT exit=1"
      FAILS+=("screenshot")
    else
      echo "SCREENSHOT exit=0"
    fi
  fi

  cleanup
  PREVIEW_PID=""
fi
trap - EXIT

if [ "${#FAILS[@]}" -eq 0 ]; then
  echo "VERIFY: PASS"
  exit 0
else
  echo "VERIFY: FAIL (${FAILS[*]})"
  exit 1
fi
