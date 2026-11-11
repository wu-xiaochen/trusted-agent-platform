#!/usr/bin/env bash
# TP-02 master verification runner — executable evidence gate.
# Reproduces every probe the evidence ledger cites. Assumes infra is up
# (scripts/bootstrap-infra.sh) and a host running on TP02_APP_PORT.
set -uo pipefail

SPIKE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SPIKE_DIR/maint-qual"

red()   { printf '\033[31m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }
step()  { printf '\n=== %s ===\n' "$*"; }
rc=0

# 1. Native authoring gate
step "os validate"
npx os validate >/tmp/tp02-validate.log 2>&1 && green PASS || { red FAIL; tail -20 /tmp/tp02-validate.log; rc=1; }

# 2. Artifact build
step "os build"
npx os build >/tmp/tp02-build.log 2>&1 && green PASS || { red FAIL; rc=1; }

# 3. Package-level native security posture tests (CJS/ESM boundary)
step "extension validator"
node "$SPIKE_DIR/scripts/validate-extension.mjs" && green PASS || { red FAIL; rc=1; }

# 4. Controlled-view/action/permission injection rejection (published spec)
step "view/action/wildcard injection probes"
node "$SPIKE_DIR/scripts/view-injection-probe.mjs" && green PASS || { red FAIL; rc=1; }
"$SPIKE_DIR/scripts/probe-wildcard-validate.sh" && green PASS || { red FAIL; rc=1; }
# probe restores the config; rebuild to leave the tree in the passing state
npx os build >/dev/null 2>&1

# 5. Durable coordination scenarios (no real external writes)
step "durable coordination simulation"
node "$SPIKE_DIR/durable/durable-coordination.sim.mjs" && green PASS || { red FAIL; rc=1; }

# 6. Live HTTP + MCP matrix (requires running host with provisioned env)
step "live permission/bypass matrix"
if curl -fsS "${TP02_BASE:-http://localhost:3100}/api/v1/health" >/dev/null 2>&1; then
  node "$SPIKE_DIR/scripts/provision-app.mjs" >/tmp/tp02-provision.log 2>&1 \
    && echo "provision: ok" || { echo "provision log:"; tail -20 /tmp/tp02-provision.log; }
  node "$SPIKE_DIR/scripts/live-matrix.mjs" && green PASS || { red FAIL; rc=1; }
else
  echo "SKIPPED: host not running on ${TP02_BASE:-http://localhost:3100}"
fi

printf '\n%s\n' "-------------------------------------------"
if [ "$rc" = 0 ]; then green "TP-02 VERIFICATION: ALL EXECUTABLE CHECKS PASSED"; else red "TP-02 VERIFICATION: FAILURES PRESENT"; fi
exit $rc
