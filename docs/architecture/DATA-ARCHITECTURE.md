# Data Architecture

**Version:** 0.1.0 · **Status:** Design baseline · **Updated:** 2026-11-03

## Data platform promise

The platform is a governed service and projection layer over existing business systems. It is not a universal data lake, a distributed transaction manager, or a license to copy every source record. It gives agents and task applications a consistent, permission-aware business view while preserving the source system as authority.

## Data planes

| Plane | Contents | Storage / lifetime | Authority |
|---|---|---|---|
| Control plane | Connections, capability grants, mappings, package revisions, policies, app specs, releases | PostgreSQL, versioned | Platform config; customer admins/business owners approve |
| Operational plane | Runs, action intents, confirmations, approvals, outbox, reconciliation, audit references | PostgreSQL plus Temporal history | Platform execution record; source remains authority for business transaction |
| Query plane | Live source results, optional bounded/cache projections, documents and time-series references | Source first; short-lived cache or narrowly scoped projection | Source system with provenance/freshness carried through |
| Model context | Minimal authorized facts and excerpts required for one run | In-memory/short-lived run state under retention policy | Derived view; never source of truth |
| Secret plane | OIDC client secrets, source credentials, model provider credentials, encryption keys | External secret manager in production; encrypted local/dev store | Customer secret system |

## Connection and capability catalog

Model these separately:

- **Connector type:** protocol/implementation (HTTP OpenAPI, PostgreSQL read, document provider, external MCP proxy).
- **Connection instance:** endpoint, authentication mode, secret reference, TLS settings, timeout and network boundary.
- **Source catalog:** discovered resources, schema fingerprint, supported operations, principal/identity scope, pagination, filters, rate limits, freshness and reconciliation support.
- **Mapping revision:** source resource/field to package object/field/relationship, transform version, source authority, evidence, test cases, and owner.
- **Capability grant:** actor/app/package scope plus specific permitted read/action IDs, environment, source identity, expiry and revocation status.

Discovery must not automatically publish a capability or grant it to an Agent. Connector metadata and MCP tool descriptions are untrusted proposals. An administrator must review scopes; a business owner reviews meanings and relationships.

## Data access patterns

### Structured systems

- Prefer documented business APIs with bounded query endpoints and source-owned commands.
- PostgreSQL connector is read-only for an explicitly granted schema and views; use separate read-only role, connection timeout, statement timeout, row limits, and query templates. No free-form SQL from an LLM.
- OpenAPI import discovers shapes and operations but does not itself authorize them. Each operation is classified read, preview, or command; write commands require a dedicated action contract.
- Use per-source rate, concurrency, timeout, cursor, row, page, and byte budgets. Propagate cancellation.

### Documents

- Store references, content hash, media type, source identity, permission scope, timestamps, and extraction version.
- Fetch/extract only the permitted content required by a declared query. Apply ACL before retrieval and again before context assembly.
- Treat document text as untrusted instructions and data. Cite source passages and retrieval time; content cannot grant a tool, role, approval, or credential.
- Keep vector retrieval optional and replaceable; do not make a vector database a mandatory platform dependency until measured need. Any index has explicit permission/delete propagation and rebuild semantics.

### Graph relationships

- Represent the executable domain model as typed objects and relationships in a versioned package, backed by relational IDs and mapping/query services.
- Start with PostgreSQL indexes and bounded joins. Add a graph database only if an evaluated workload requires traversal or graph algorithms that the current storage cannot handle.
- Do not expose arbitrary graph queries or unrestricted graph expansion to the model.

### Time-series and industrial data

- Start with source time-series APIs or a read-only connector that enforces time range, resolution, aggregation, and point limits.
- Return explicit units, sampling interval, timestamps/time zone, gaps, quality code, and source watermark.
- Do not stream device control commands or join real-time safety loops through an LLM.
- Add a dedicated time-series store only after a concrete workload demonstrates need for durable local windows, aggregation, and retention.

## Federation, projection, and freshness

Default to source federation for small interactive reads. Add a projection only for a named task need such as reliable cross-source joins, offline operation, or expensive source calls. Every projection records source key/version, observed/fetched time, source watermark, mapping revision, quality, and deletion/permission sync status.

No cross-source global snapshot is implied. Each source result carries a freshness class (`live`, `recent`, `stale`, `unknown`) defined by the capability. A partial failure lists the unavailable source and affected fields. Unknown is never converted to a safe-looking default such as zero, empty list, or “not found.”

Define connection limits per installation and capability: maximum parallel calls, per-source timeout, request bytes, response bytes, rows, pages, total run budget, and model-context budget. Reject or return a typed truncation status when a limit is reached.

## Authorization, caching, and deletion

- Filter using the current principal's source identity or an explicitly approved service identity with documented scope.
- Authorization happens before data is loaded into the model context, then again before sensitive data is returned or an action is submitted.
- Cache keys include installation, actor/access scope, package revision, capability, normalized query and source/mapping revision. Shared cache entries cannot broaden authorization.
- Revocation invalidates grants and relevant cache immediately. Projection and vector-index deletion is tracked to completion; a failed deletion is visible and can block further retrieval.
- Define source-specific data retention and export. Customer data is not used for training by platform behavior; any provider data handling is explicitly configured and disclosed.

## Core persistence model

Every operational row belongs to the one-installation workspace. Use UUIDv7/UUID primary keys as implementation decides; stable package IDs are human-readable and namespaced. Store timestamps in UTC and render in user locale.

| Entity | Important fields / constraints |
|---|---|
| `workspace_settings` | install identity, public URL, locale, retention policy, encryption-key references |
| `memberships` | OIDC issuer + subject unique key, roles/attributes, status; no local password table in v1 |
| `connections` | connector type/version, endpoint, identity mode, secret reference, status, owner, revision |
| `source_catalog_entries` | connection, resource ID, schema fingerprint, operation capability, limits, last verified time |
| `mapping_revisions` | source catalog entry, package/object/field IDs, transform, authority, tests, author |
| `package_revisions` | package ID, semantic version, canonical JSON, content digest, lifecycle, parent digest, author |
| `business_decisions` | decision kind, rule/effect/package digest, actor, policy revision, scope, outcome, expiry |
| `app_specs` / `releases` | immutable app/package digests, component registry version, environment, publisher |
| `capability_grants` | principal/role, source/app/package scope, capability, allowed operation, expiry/revocation |
| `runs` | actor, release, request, state, timestamps, model/provider metadata, redacted evidence refs |
| `action_intents` | business key/idempotency key, effect digest, parameters hash, state, source correlation |
| `approvals` | action intent/effect digest, approver, outcome, policy revision, timestamps, reason code |
| `outbox_events` | event ID, aggregate/version, payload reference, delivery state and attempts |
| `audit_events` | actor, action, decision, target, correlation, version refs, result code, redacted metadata |
| `sync_checkpoints` | connection/resource, source watermark, mapping revision, deletion watermark, state |

Detailed SQL migrations are authored with implementation and reviewed as code. Enforce foreign keys, unique source identity and idempotency constraints, optimistic revision locks, and tenant/workspace scoping. PostgreSQL Row Level Security may provide defense in depth but must not replace kernel authorization or source permissions.

## Provenance and lineage envelope

Each field or evidence item returned to a user or model should be traceable to a compact envelope:

```json
{
  "sourceId": "inventory-main",
  "resourceId": "stock-item",
  "recordRef": "opaque-source-reference",
  "observedAt": "2026-11-03T08:00:00Z",
  "fetchedAt": "2026-11-03T08:00:01Z",
  "sourceVersion": "etag-or-watermark",
  "mappingRevision": "inventory-mapping@3",
  "quality": "complete",
  "sensitivity": "internal",
  "evidenceRef": "ev_..."
}
```

Do not copy raw credentials, full SQL, arbitrary document text, or unnecessary personal data into lineage. Provenance is itself access-controlled.

## Data contract evolution

Package and connector schemas are explicit, versioned, and validated at publish time. Breaking field or action semantics require a new major package version and a migration/compatibility note. New optional fields can be minor changes only when defaults and privacy classification are explicit. Connector schema drift pauses dependent capabilities until remapped and retested. Never mutate a published package in place.

