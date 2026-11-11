# G8/G9/G10 — connector, pre-context filter and drift findings

Synthetic source: containerized PostgreSQL 17 (`source-db`, port 55433)
owning schemas `inventory.spare_part` and `eam.work_order`; a narrow login
`tp02_ro` (`default_transaction_read_only=on`, USAGE+SELECT on `inventory`,
column-scoped SELECT `(wo_no,title,status)` on `eam.work_order`). The canary
column `technician_ssn` exists for the owner login only. Setup:
[`../infra/source-init/10-roles.sh`](../infra/source-init/10-roles.sh).

## Identity mode

- Installation **service identity** for the federated connection: the narrow
  DB role is one shared read-only credential bound through the platform
  secret store. Row/field authorization toward the *user* is enforced by the
  ObjectStack permission chain (RLS on platform objects, FLS field mask) —
  the source role itself carries no user delegation (no per-user PG
  credentials). For true delegated identity the product needs either
  per-connection credentials or a view/RLS strategy in the source; this
  edition's generic Postgres federation has no user-impersonation knob.
- The credential never enters the metadata: `os validate` rejects an inline
  `config.password` ("is a credential and is not accepted inline … lands in
  cleartext at rest") and the runtime admin door encrypts it into
  `sys_secret`, persisting only an opaque `external.credentialsRef`. GET on
  the datasource reports `hasSecret:true` with the config redacted.

## Boot validation and connection

- A code-declared external datasource with explicit object bindings is
  fail-fast at boot: with the credential unbound, plugin startup failed and
  rolled back ("no fallback datasource … every read/write would fail ⇒
  fail-fast per ADR-0062 D5"). This drove the correct architecture — source
  bindings are **runtime environment config** (`POST /api/v1/datasources`
  with a `secret` field), not package metadata.
- `POST /api/v1/datasources/test` (unsaved draft, secret inline in that
  request only) returned live connectivity: `ok:true, latencyMs:10,
  serverVersion:"PostgreSQL 17.11 …"`; the saved datasource reported
  `status:"ok"`.

## Bounded read, provenance, pre-model filtering (G8/G9)

- Live federated read via the normal REST surface returns exactly the three
  source rows; `limit` is bounded (tool schema caps at 50; measured `limit=2`
  → 2 rows).
- The same six-gate authorization chain applies to federated objects as to
  managed objects: technician with a runtime permission set reads rows;
  planner without it gets 403; the canary column never exists in the object
  schema and an explicit `fields=technician_ssn` is refused
  (`Unknown field … dropping an unknown one silently answered a NARROWER
  projection with a WIDER one`).
- Source-side defense measured directly with `psql` as the narrow role:
  - INSERT → `ERROR: cannot execute INSERT in a read-only transaction`;
  - SELECT technician_ssn → `permission denied for table work_order`.
- **Field filtering before any model context:** `unit_cost` is masked on the
  read response for the technician (key stripped), and filtering/sorting by
  it returns 403 ("Filtering, sorting, grouping, or aggregating by a hidden
  field would leave a value oracle"). MCP queries return the same masked
  projection — there is no agent/model in this spike that could receive the
  raw value; the platform boundary sits in the engine, not in prompt policy.
- The platform federation layer adds its own **double opt-in** write gate
  independent of role: POST/PATCH against the federated object returns
  `403 EXTERNAL_WRITE_FORBIDDEN` for the technician **and the platform
  admin** unless both `datasource.external.allowWrites` and
  `object.external.writable` are set. No DDL is ever issued against the
  source (`schemaMode: external`).

## Schema drift (G10) — two distinct behaviors, measured

1. **Live session drift** (column renamed on the source after boot): queries
   kept succeeding and the drifted column (`warehouse`) was simply absent
   from rows; `POST /:name/test` stayed green because it tests connectivity,
   not schema. The cached introspection/schema binding does not hot-refresh.
   The `onMismatch` policy is therefore primarily a **boot-time** control.
2. **Restart with drift**: boot failed closed with
   `✗ missing_column: spare_part.warehouse` and "Bootstrap failed … rolling
   back started plugins" — the process exited rather than serving a
   half-bound federation. Restoring the column let the host boot normally.

Product implication (matches the design docs): treat schema fingerprints as
a precondition in the source mapping, run `os migrate plan`/datasource test
before release, and surface stale-binding status; do not assume live queries
fail immediately on drift.

## Unsupported-feature behavior (G8/G10)

- Removing the grants (or pointing at an unreachable host without the
  degraded flag) makes the bound objects answer explicit typed errors
  (`503 ERR_DATASOURCE_UNAVAILABLE`), never silently empty results or a
  fallback to the platform store.
- No source pagination/freshness/partial-result envelope is synthesized by
  the generic federation path; row/byte/time budgets must be added by the
  product connector layer (the platform does provide statement timeouts on
  the driver config and query `limit`). This is a planned extension surface,
  not a framework feature.
