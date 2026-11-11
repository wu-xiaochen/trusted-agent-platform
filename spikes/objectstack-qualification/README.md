# TP-02 ObjectStack qualification spike

Disposable, synthetic verification of ObjectStack 18.2.0 against the trust
boundaries in [`docs/specs/TP-02-objectstack-qualification.md`](../../docs/specs/TP-02-objectstack-qualification.md).
Decision and gate matrix:

- **[OBJECTSTACK-QUALIFICATION.md](OBJECTSTACK-QUALIFICATION.md)** — result: **QUALIFIED** under bounded conditions
- **[evidence-ledger.md](evidence-ledger.md)** — per-gate status and pointers
- [pin.md](pin.md) · [environment.md](environment.md) — exact versions and host setup
- [package-license-matrix.md](package-license-matrix.md) · [bootstrap-log.md](bootstrap-log.md)
- [oidc-notes.md](oidc-notes.md) · [permission-bypass-matrix.md](permission-bypass-matrix.md)
- [connector-findings.md](connector-findings.md) · [extension-view-findings.md](extension-view-findings.md)
- [protocol-findings.md](protocol-findings.md) · [temporal-findings.md](temporal-findings.md)

Nothing here is production code or customer data: all users, passwords,
work orders and source rows are synthetic; all generated secrets live in
git-ignored `local/`.

## Reproduce

Prerequisites: Docker, Node 22, corepack pnpm 10.31.0, free loopback
ports 55432/55433/5556/3100.

```bash
# 1. infra: platform Postgres + external read-only source Postgres + Dex OIDC
./scripts/bootstrap-infra.sh

# 2. host (production-shaped: NODE_ENV=production, compiled artifact, Postgres)
cd maint-qual
corepack pnpm@10.31.0 install
npx os build
set -a && . ../local/app.env && set +a
export OS_ARTIFACT_PATH="$PWD/dist/objectstack.json" \
       TP02_SOURCE_RO_PASSWORD=tp02-ro-synthetic-pw
npx os start            # serves http://localhost:3100

# 3. provision synthetic users/positions/records/datasource (idempotent)
cd ..
TP02_SOURCE_RO_PASSWORD=tp02-ro-synthetic-pw node scripts/provision-app.mjs

# 4. full executable verification (35 live assertions + authoring gates + sims)
TP02_SOURCE_RO_PASSWORD=tp02-ro-synthetic-pw ./scripts/run-all.sh

# 5. backup/restore drill (separate scratch DB + second host instance)
./scripts/restore-drill.sh
```

Teardown:

```bash
docker compose -f infra/compose.yml --env-file local/.env down -v
pkill -f "os start"
```

## Layout

| Path | Purpose |
|---|---|
| `maint-qual/` | App scaffolded with the official `create-objectstack@18.2.0`; native objects/actions/permissions/views only |
| `extension/` | Narrow task-evidence extension referencing native IDs (no parallel schema) |
| `durable/` | Deterministic ledger/outbox + unknown-outcome coordination simulation |
| `infra/` | Digest-pinned compose (two Postgres 17, Dex 2.42) and source role DDL |
| `scripts/` | Infra, provisioning, MCP/OIDC clients, live matrix, drills, validators |
| `local/` (git-ignored) | Generated env/secrets, logs, tokens, dumps, backups |
