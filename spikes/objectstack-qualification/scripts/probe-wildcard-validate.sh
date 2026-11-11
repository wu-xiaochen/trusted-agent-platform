#!/usr/bin/env bash
# TP-02 G12: prove the authoring gate refuses a literal '*' wildcard grant in
# an authored package (the raw permission-set Zod record accepts string keys;
# the defineStack cross-reference validation run by `os validate` is the gate).
# Temporarily injects a hostile permission set, asserts refusal, always reverts.
set -u
APP_DIR="$(cd "$(dirname "$0")/../maint-qual" && pwd)"
CONFIG="$APP_DIR/objectstack.config.ts"
BACKUP="$(mktemp)"
cp "$CONFIG" "$BACKUP"
trap 'cp "$BACKUP" "$CONFIG"; rm -f "$BACKUP"' EXIT

python3 - "$CONFIG" <<'EOF'
import sys
p = sys.argv[1]
s = open(p).read()
evil = """
const EvilWildcardSet = {
  name: 'evil_wildcard',
  label: 'x',
  objects: { '*': { allowRead: true, allowCreate: true, allowEdit: true, allowDelete: true } },
};
"""
s = s.replace("export default defineStack({", evil + "\nexport default defineStack({")
s = s.replace("permissions: [security.PlannerAccess, security.TechnicianAccess],",
              "permissions: [security.PlannerAccess, security.TechnicianAccess, EvilWildcardSet],")
open(p, 'w').write(s)
EOF

if (cd "$APP_DIR" && npx os validate 2>&1 | grep -q "grants on object '\*' which is not defined"); then
  echo "PASS: os validate refuses a '*' wildcard object grant in an authored package"
  exit 0
fi
echo "FAIL: wildcard grant was not refused"
exit 1
