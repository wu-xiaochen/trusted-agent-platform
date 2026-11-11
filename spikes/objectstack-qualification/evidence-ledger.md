# TP-02 Evidence Ledger

**Overall result: `qualified`** — full report:
[OBJECTSTACK-QUALIFICATION.md](OBJECTSTACK-QUALIFICATION.md). Every critical
gate below has reproducible evidence; run `scripts/run-all.sh` after
`scripts/bootstrap-infra.sh`. The live matrix currently reports 35/35
checks passing.

| # | Gate | Result | Evidence pointer |
|---|---|:--:|---|
| G0 | Protocol/version freeze, pin before install | **pass** | [pin.md](pin.md); commit `27f38ada…`, tag `@objectstack/cli@18.2.0` |
| G1 | Per-package license inventory; unclear/commercial excluded | **pass** | [package-license-matrix.md](package-license-matrix.md), [../package-license-summary.json](../package-license-summary.json) |
| G2 | Clean checkout boots minimal host vs PostgreSQL; no closed control plane | **pass** | [bootstrap-log.md](bootstrap-log.md) §2–4 |
| G3 | Schema migration, restart, backup/restore on disposable data | **pass** | [scripts/restore-drill.sh](scripts/restore-drill.sh); bootstrap-log §5–6 |
| G4 | External OIDC: issuer/audience, identity mapping, session, revocation, logout semantics | **pass** | [oidc-notes.md](oidc-notes.md); [scripts/oidc-login.mjs](scripts/oidc-login.mjs) |
| G5 | Default-deny object/field/record reads through REST, client path and MCP with two disjoint users | **pass** | [permission-bypass-matrix.md](permission-bypass-matrix.md); live matrix G5 rows |
| G6 | Direct create/update/delete unavailable for source-owned records on every exposed path | **pass** | 8/8 REST verbs + 3/3 MCP write tools + RBAC self-escalation denied |
| G7 | Grant/session change takes effect on next protected request incl. cache paths | **pass** | position grant removal and `sys_api_key.revoked` both enforced immediately; grants TTL cache defaults off |
| G8 | Read-only source identity; typed bounded reads, pagination, time/row/byte limits, provenance | **pass with condition** | [connector-findings.md](connector-findings.md); budget/provenance envelope is platform work (F-4) |
| G9 | Authz + field filtering before any model call; protected values absent from provider input/logs/MCP | **pass** | engine FLS strip + predicate 403 on REST and MCP; no model surface in spike |
| G10 | Source schema change → capability visibly stale or blocked, not silently re-meaninged | **pass with condition** | restart fail-closed on `missing_column`; live drift lazy (F-3) |
| G11 | Native object/relation/query/action/permission/view via supported contracts; extension by stable IDs only | **pass** | [extension-view-findings.md](extension-view-findings.md); [scripts/validate-extension.mjs](scripts/validate-extension.mjs) |
| G12 | Renderer rejects arbitrary script, unknown component, forbidden field, unbound action, model-supplied effect/approval | **pass** | [scripts/view-injection-probe.mjs](scripts/view-injection-probe.mjs), wildcard gate script, action param-schema 400 |
| G13 | Ledger/outbox atomic before orchestration; duplicate delivery safe; pre-commit timeout; commit-then-lost-response; reconcile failure → unknown/manual review | **pass** | [temporal-findings.md](temporal-findings.md); [durable/durable-coordination.sim.mjs](durable/durable-coordination.sim.mjs) |
| G14 | No secrets/sensitive business args in durable history/logs (canary) | **pass** | canary asserted absent from ledger/outbox/history in all scenarios |
| G15 | MCP auth maps principal into same kernel; per-tool per-call authz; untrusted metadata cannot escalate | **pass (M-1 bounded)** | [protocol-findings.md](protocol-findings.md); `describe_object` field-name asymmetry documented |
| G16 | External MCP/Skills static vs executable; AG-UI transport-only | **pass / AG-UI deferred** | protocol-findings; outbound stdio default-deny verified in source+tests; skills = md/json only |
| G17 | Framework/provider classification vs documented/private/fork APIs; footprint | **pass** | bootstrap-log §7; all used APIs are public spec/REST/CLI/MCP contracts |

## Evidence artifacts

```text
maint-qual/                     scaffolded 18.2.0 app (native metadata only)
extension/task-evidence.json    narrow platform extension bound by native IDs
durable/                        ledger/outbox coordination simulation
infra/                          digest-pinned Postgres + Postgres + Dex compose
scripts/                        reproducible provisioning, probes and drills
local/ (git-ignored)            generated secrets, logs, tokens, backups, dumps
```

## Open risks handed to product backlog

F-1 source connections are runtime config (secret door), F-2 block-list/union
FLS posture, F-3 live drift freshness, F-4 budget/provenance envelope,
F-5 elevated action handler responsibility, M-1 MCP schema field-name
disclosure, and two non-fatal boot-time index-reconciliation errors.
Operational acceptance for a real Temporal cluster remains a TP-12 task.
