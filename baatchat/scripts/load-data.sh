#!/usr/bin/env bash
# One-shot Phase 1 data load against the live API.
# - Logs in as admin (password prompted, never stored)
# - Runs /admin/sync (investors, loaners, loans, orders)
# - Loops /admin/resolve-addresses until no further progress
# Requires: Workers Paid (free plan's 50-subrequest cap breaks /admin/sync).
set -euo pipefail

API="${API:-https://api.oblinorchat.app}"
EMAIL="${EMAIL:-bk@oblinor.no}"

read -s -p "Admin password for $EMAIL: " PW; echo
echo "→ Logging in…"
LOGIN=$(curl -s -X POST "$API/auth/admin-login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PW\"}")
unset PW
TOKEN=$(printf '%s' "$LOGIN" | grep -o '"token":"[^"]*"' | head -1 | sed 's/"token":"//;s/"$//')
if [ -z "$TOKEN" ]; then
  echo "✗ Login failed: $LOGIN"; exit 1
fi
echo "✓ Authenticated"

echo "→ Syncing data (this can take a bit)…"
SYNC=$(curl -s --max-time 300 -X POST "$API/admin/sync" \
  -H "Authorization: Bearer $TOKEN")
echo "  sync: $SYNC"
if printf '%s' "$SYNC" | grep -qi "subrequest"; then
  echo "✗ Hit the free-plan subrequest cap. Upgrade to Workers Paid, then rerun this script."
  exit 1
fi
if ! printf '%s' "$SYNC" | grep -q '"ok":true'; then
  echo "✗ Sync did not succeed — see response above."; exit 1
fi

echo "→ Resolving loan addresses via Kartverket…"
TOTAL_RESOLVED=0
for i in $(seq 1 200); do
  R=$(curl -s --max-time 120 -X POST "$API/admin/resolve-addresses?limit=45" \
    -H "Authorization: Bearer $TOKEN")
  RES=$(printf '%s' "$R" | grep -o '"resolved":[0-9]*' | sed 's/[^0-9]//g'); RES=${RES:-0}
  REM=$(printf '%s' "$R" | grep -o '"remaining":[0-9]*' | sed 's/[^0-9]//g'); REM=${REM:-0}
  TOTAL_RESOLVED=$((TOTAL_RESOLVED + RES))
  echo "  round $i: $R"
  # Stop when nothing left, or when a round makes no progress (rest are unresolvable).
  if [ "$REM" -eq 0 ] || [ "$RES" -eq 0 ]; then break; fi
done

echo "✓ Done. Addresses resolved this run: $TOTAL_RESOLVED"
echo "  (Remaining unresolved are addresses Kartverket couldn't match — review separately.)"
