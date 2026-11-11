# ObjectStack 18.2.0 — TP-02 runtime qualification report

**Result: QUALIFIED** for adoption as the product's business-metadata runtime
kernel, under the bounded conditions listed in §6. Every **critical** gate
(default-deny identity, generic-CRUD containment on source-owned records,
external federation read gate, native metadata extension seam, MCP
principal bridging, and unknown-outcome coordination invariants) was
exercised against the running software on PostgreSQL with an external OIDC
issuer and a read-only external database. No critical gate was bypassed.

- Candidate pin: release train **18.2.0**, monorepo commit
  `27f38ada498162835c2f1d56e6edabe18910b4ed`, tag `@objectstack/cli@18.2.0`.
- Executed: 2026-11-03 on macOS arm64 (environment in [environment.md](environment.md)).
- Reproduce everything: [scripts/run-all.sh](scripts/run-all.sh) after
  [scripts/bootstrap-infra.sh](scripts/bootstrap-infra.sh).

## 1. What was built

A disposable synthetic vertical in `maint-qual/` (scaffolded via the official
`create-objectstack@18.2.0`):

- native managed objects `maint_qual_work_order` (read-only to all business
  roles) and `maint_qual_spare_request` (effect object, writable only by the
  elevated named-action handler);
- a named action `maint_request_spare` gated by a declared capability, CEL
  visibility and a handler that honors `recordLoadDenied` and derives every
  effect field server-side;
- two positions/permission sets with disjoint row and field grants, RLS
  predicates and FLS masking;
- a RUNTIME-provisioned external Postgres datasource (`schemaMode:
  external`, no inline credential, secret in `sys_secret`) with a federated
  object `maint_qual_spare_part`;
- native grid/form views and one app shell; no custom renderer code.

Infrastructure (all digest-pinned, disposable): platform Postgres 17,
external source Postgres 17 with a narrow read-only login and a canary
column, and Dex v2.42.0 as a real external OIDC issuer
([infra/compose.yml](infra/compose.yml)).

## 2. Gate-by-gate verdict

Evidence files contain the raw commands/output mappings; the executable
matrix is [scripts/live-matrix.mjs](scripts/live-matrix.mjs) (35/35 passing).

| Gate | Verdict | Primary evidence |
|---|---|---|
| G0 pin/install/license clarity | **pass** | [pin.md](pin.md), [package-license-matrix.md](package-license-matrix.md), pnpm-lock.yaml in the spike app |
| G1 clean Postgres boot, no closed control plane | **pass** | [bootstrap-log.md](bootstrap-log.md) §2–4 |
| G2 migration/restart/restore drill | **pass** | [scripts/restore-drill.sh](scripts/restore-drill.sh), bootstrap-log §5–6 |
| G3 external OIDC (issuer/audience/identity/session/revocation) | **pass** | [oidc-notes.md](oidc-notes.md), [scripts/oidc-login.mjs](scripts/oidc-login.mjs) |
| G4 default-deny object/field/record on REST + client + MCP | **pass** | live matrix G5 rows, [permission-bypass-matrix.md](permission-bypass-matrix.md) |
| G5 generic write containment for source-owned objects | **pass** | 8/8 REST verb denials + 3/3 MCP write-tool denials + RBAC self-escalation 403 |
| G6 grant/session revocation on next request | **pass** | position removal and API-key revocation both enforced immediately |
| G7 narrow read-only source, bounded reads, pagination/limits/typing | **pass with condition** | [connector-findings.md](connector-findings.md); product must add time/byte/page budgets + provenance envelope |
| G8 field filtering before model context | **pass** | engine-level FLS mask + predicate 403; no model receives ungranted fields anywhere in the spike |
| G9 schema drift visibly stale/blocked | **pass with condition** | boot fail-closed on drift (`missing_column`) measured; LIVE drift binds lazily — product fingerprint/pre-release check required |
| G10 native extension via stable IDs, no duplicate schema | **pass** | [extension-view-findings.md](extension-view-findings.md), [scripts/validate-extension.mjs](scripts/validate-extension.mjs) |
| G11 controlled view rejects script/unknown-component/etc. | **pass** | [scripts/view-injection-probe.mjs](scripts/view-injection-probe.mjs), [scripts/probe-wildcard-validate.sh](scripts/probe-wildcard-validate.sh) |
| G12 ledger/outbox atomicity, dedupe, unknown→manual review | **pass** | [durable/durable-coordination.sim.mjs](durable/durable-coordination.sim.mjs), [temporal-findings.md](temporal-findings.md) |
| G13 no sensitive args in durable history/logs | **pass** | canary asserted absent from journal/outbox/history in every simulated state |
| G14 MCP principal mapping, per-call authz, untrusted metadata | **pass with condition M-1** | [protocol-findings.md](protocol-findings.md); matrix G15 rows |
| G15 skills static; AG-UI classification | **pass (skills) / deferred (AG-UI)** | skills tree is 92 md/json files, zero code; AG-UI is not a framework package → platform transport deliverable |
| G16 footprint/upgrade path | **pass** | host ≈ 218 MB RSS; artifact ≈ 21 KB; `os migrate plan/apply`; immutable artifact digest boot supported |

The old ADR-0002 conditions map 1:1 to the original nine acceptance
criteria (OpenAPI/DB migration, OIDC, disjoint permissions, generic CRUD
disabled, read-only adapter, plugin seam, native views, Temporal
coordination, licenses): all satisfied, with the two connector-layer
refinements (budgets envelope, drift freshness) carried forward rather
than discovered as failures.

## 3. Security properties confirmed by execution (not docs)

1. **Anonymous deny is unconditional and has no deployment escape hatch in
   the default composition** — data/meta/MCP all 401 without identity;
   `/graphql` is 404; no `api.requireAuth:false` key exists in the 18.x
   protocol (tombstoned at v17).
2. **The additive baseline cannot be bypassed by doing nothing**: the
   shipped `member_default` set contains no business-object wildcard
   (verified in upstream source and by runtime probes), so a fresh custom
   object is inaccessible until explicitly granted.
3. **Generic writes cannot produce source effects**: both business roles
   are refused POST/PATCH/DELETE on work orders and effect records through
   REST and MCP; the only write producer is the server-elevated named
   action, itself gated by capability, CEL visibility and caller-scoped
   record load. Model-supplied effect fields are schema-rejected.
4. **External data is read-only twice over** (datasource default + object
   opt-in both off), for the admin too; credentials are encrypted at rest
   and never present in metadata or artifact responses; a wrong master key
   yields typed unavailability, never cleartext fallback.
5. **Revocation is request-time** with the default cache disabled;
   positions and API keys revoked mid-session take effect on the next
   call, and federation fails closed when the source is unreachable or
   drifted across a restart.
6. **No parallel metadata authority** was introduced: the task extension
   is a narrow JSON envelope referencing native IDs, its validator rejects
   unresolved references and embedded approvals/credentials, and the
   federated source binding is environment config attached to a native
   runtime object — the exact split `DOMAIN-PACKAGE.md` prescribes.

## 4. Findings that change product design (non-blocking)

- **F-1 Source capability is environment config, not package metadata.**
  Code-defined external datasources are read-only after boot and reject
  inline credentials; connection + credential live behind the
  platform-admin datasource door. The release envelope therefore binds
  native object IDs to connections created at deploy time; the task
  extension already models this (`sourceMappings[].schemaFingerprint`).
- **F-2 Field security is block-list/union (upstream ADR-0066 ⑧).** There
  is no deny-veto; sensitive fields must only be granted to narrow sets.
  Platform packaging guidance + an authoring lint are needed; grant
  caching must remain off (or use the cluster invalidation bus) in
  multi-node deployments.
- **F-3 Live federation drift is detected at boot, not on every query.**
  Schema fingerprints must be checked in the deploy/pre-release path and
  the capability record surfaced; do not assume a query fails immediately
  after a source column change.
- **F-4 The generic federation path does not synthesize row/byte/time
  budgets or provenance/freshness/partial-result envelopes.** The product
  connector layer must add these (driver statement timeout and query
  `limit` exist as primitives).
- **F-5 Action handlers run system-elevated by design.** This makes the
  named-action boundary the correct and ONLY write model; it also means
  platform review rules must live inside handlers (`recordLoadDenied`,
  explicit validation, canonical effect construction) — there is no
  ambient per-user RLS inside a handler.
- **M-1 MCP `describe_object` discloses the names/types of fields the
  caller cannot read** while `/meta/object` masks them. Values stay
  protected and predicate probing stays closed; request upstream parity
  or accept name disclosure explicitly.
- Boot emits two non-fatal SQL index-reconciliation errors every start
  (`cannot drop index … requires it`); harmless to data but noisy for
  operations; track upstream.

## 5. What this qualification did NOT cover

Browser/Console screenshots and the full ObjectUI component catalog
(the API/metadata enforcement behind them was tested directly); a real
corporate IdP (Dex stands in for the protocol); the `group`/`isolated`
multi-organization walls and SCIM; load/performance and HA failover; an
on-network live Temporal cluster rehearsal (contract-level simulation
only — TP-12 operational acceptance); outbound connector calls to a
real third-party OpenAPI/MCP server; long-lived session-idle expiry
measurement; the approvals plugin wired to the action (queue exists,
policy design is product work).

## 6. Adoption conditions (bounded, per ADR-0002)

1. Pin deployments to 18.2.x; consume framework packages only from the
   Apache-2.0 train; record the jszip MIT-branch decision and the
   `buffers` provenance item in the OSS process; replace MPL/PSF items if
   legal rejects build-time MPL.
2. Keep business objects private by default and ship platform permission
   packages + lint guidance that assume union/block-list FLS; never enable
   grants caching without the cluster invalidation bus.
3. Implement source connections through the runtime datasource door with
   `sys_secret`; add schema-fingerprint gating to the release flow and
   the budget/provenance envelope to the platform connector layer.
4. Build writes exclusively as named actions with server-canonical
   effects; implement the effect-digest/confirmation/idempotency ledger
   and Temporal-owned reconciliation (platform packages, not framework
   features).
5. Re-run this spike's `run-all.sh` on every framework minor upgrade;
   revisit on any change to the authorization chain, the action execution
   context or the MCP bridge.

Reconsideration trigger: any x.0 minor where the anonymous-deny chain,
named-action elevation model, external double-write gate, metadata-door
redaction or MCP principal bridge changes behavior; upstream abandonment
of the Apache-2.0 self-hosted train; or a security advisory without a
patch window the project can accept.
