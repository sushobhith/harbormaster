#!/usr/bin/env bash
# Live check after a deploy (curl only): new host serves / with its own canonical, og-image, sitemap, robots; www 3xx to apex; old hosts 308 with path+query.
# Usage: scripts/verify_live.sh [NEW_HOST] [OLD_HOST ...]  defaults harbormaster.fyi; harbormaster.vercel.app fairhex.vercel.app ("none" = skip old hosts)
# The post-deploy gate named in CLAUDE.md and DECISIONS D-013 (negative proof: TEST_PLAN TP-33). One PASS/FAIL line per check; exit 1 on any FAIL.
# Also the smoke step that ROADMAP Step 1.3's deploy workflow calls.
set -u

NEW="${1:-harbormaster.fyi}"
[ $# -gt 0 ] && shift
if [ $# -eq 0 ]; then OLD=(harbormaster.vercel.app fairhex.vercel.app)
elif [ "$*" = "none" ]; then OLD=()
else OLD=("$@"); fi

CURL=(curl -sS --connect-timeout 10 --max-time 30 -A "harbormaster-verify-live/1.0")
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
PASSN=0; FAILN=0
pass() { echo "PASS $1"; PASSN=$((PASSN + 1)); }
fail() { echo "FAIL $1 (got: $2)"; FAILN=$((FAILN + 1)); }

# fetch URL -> CODE, CTYPE, RC; body in $TMP/body
fetch() {
  : > "$TMP/body"; : > "$TMP/head"
  CODE="$("${CURL[@]}" -o "$TMP/body" -D "$TMP/head" -w '%{http_code}' "$1" 2>/dev/null)"; RC=$?
  CTYPE="$(grep -i '^content-type:' "$TMP/head" | tail -1 | cut -d: -f2- | tr -d ' \r')"
}
# redir URL -> CODE, LOC, RC (does not follow)
redir() {
  local out; out="$("${CURL[@]}" -o /dev/null -w '%{http_code} %{redirect_url}' "$1" 2>/dev/null)"; RC=$?
  CODE="${out%% *}"; LOC="${out#* }"; [ "$LOC" = "$out" ] && LOC=""
}
snip() { head -c 120 "$TMP/body" | tr -s '\r\n\t' '   '; }

# check_get WHAT URL NEEDLE [CTYPE_PREFIX]: 200 and (content-type prefix or body contains NEEDLE)
check_get() {
  local what="$1" url="$2" needle="$3" ctype="${4:-}"
  fetch "$url"
  if [ "$RC" -ne 0 ]; then fail "$what" "curl exit $RC"; return; fi
  if [ "$CODE" != "200" ]; then fail "$what" "status $CODE"; return; fi
  if [ -n "$ctype" ]; then
    case "$CTYPE" in "$ctype"*) pass "$what" ;; *) fail "$what" "status 200, content-type '$CTYPE'" ;; esac
  elif grep -qF -- "$needle" "$TMP/body"; then pass "$what"
  else fail "$what" "status 200, missing '$needle'; body: $(snip)"; fi
}

# New host
check_get "$NEW/ 200 with canonical https://$NEW/" "https://$NEW/" "rel=\"canonical\" href=\"https://$NEW/\""
check_get "$NEW/og-image.png 200 image/png" "https://$NEW/og-image.png" "" "image/png"
check_get "$NEW/sitemap.xml 200 naming https://$NEW/" "https://$NEW/sitemap.xml" "https://$NEW/"
check_get "$NEW/robots.txt 200 naming https://$NEW/sitemap.xml" "https://$NEW/robots.txt" "https://$NEW/sitemap.xml"

what="www.$NEW/ 3xx -> https://$NEW/"
redir "https://www.$NEW/"
if [ "$RC" -ne 0 ]; then fail "$what" "curl exit $RC"
else case "$CODE:$LOC" in 3??:"https://$NEW/"*) pass "$what" ;; *) fail "$what" "$CODE ${LOC:-<no location>}" ;; esac; fi

# Old hosts: exactly 308 to the exact new URL (path and query preserved)
for OH in ${OLD[@]+"${OLD[@]}"}; do
  for p in "/" "/og-image.png?x=1"; do
    what="$OH$p 308 -> https://$NEW$p"
    redir "https://$OH$p"
    if [ "$RC" -ne 0 ]; then fail "$what" "curl exit $RC"
    elif [ "$CODE" = "308" ] && [ "$LOC" = "https://$NEW$p" ]; then pass "$what"
    else fail "$what" "$CODE ${LOC:-<no location>}"; fi
  done
done

echo "$PASSN passed, $FAILN failed"
[ "$FAILN" -eq 0 ]
