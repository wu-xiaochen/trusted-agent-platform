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

### Compatibility tiers and onboarding experience

“Compatible” is a reported test result for specific operations, auth modes, and connector versions, not a marketing-wide yes/no. Every connector catalog entry exposes one of these support tiers: **native** (maintained and contract-tested by this project), **beta** (implemented with stated gaps and narrower test coverage), **custom** (customer/community adapter using the published port and contract suite), or **unsupported** (the reason and required extension are shown). Each verified source profile records connector version, protocol/version, auth mode, operation-level capabilities, limits, schema fingerprint, last test time, and known gaps.

The initial path is “import or configure → inspect → secure auth → test sample → map → grant.” OpenAPI documents and Postman collections may seed endpoint discovery; a direct endpoint can be configured manually when metadata is absent. The importer never executes an operation merely because it is described. It displays operations and classifies them as read, preview candidate, or command candidate; only reviewed read operations become query capabilities. A write operation requires a separate named action contract. Credentials are entered through a secret-reference form and never passed to the Agent or returned to the browser after save. API discovery and test requests use allowlisted hosts, bounded response sizes, timeouts, safe `$ref` resolution, and SSRF protections.

The first HTTP adapter should support only explicitly qualified authentication modes: static bearer token, API key in a configured header/query location, OAuth 2.0 client credentials, and anonymous access only when the source owner explicitly allows it. OAuth user delegation, mTLS, signed requests, SAML-to-API gateways, proprietary token exchange and other schemes remain `beta/custom/unsupported` until implemented and tested. Do not send credentials in query strings unless the source contract requires it; when it does, redact URLs from logs and audit. The onboarding report names the chosen principal model (`delegated user` or `installation service identity`) and its effective scope. A service identity is never presented as user delegation.

Initial native path: OpenAPI-described HTTP APIs, explicitly configured REST APIs, read-only PostgreSQL, and bounded CSV, JSON, Markdown, PDF and DOCX ingestion after each parser passes the file contract/security suite. XLSX, scanned OCR, email archives and other office formats are beta/custom until measured and verified. Support for GraphQL, OData, SOAP/WSDL, additional SQL engines, vendor-specific ERP/EAM/MES/CRM templates, event brokers, and industrial protocols is an adapter roadmap, not a v1 blanket promise. The actual source compatibility table lives in the release documentation and is updated only with contract-test evidence. For example, OpenAPI is useful because it is a language-agnostic API description, but it cannot establish the API's business meaning, identity scope, or write safety ([OpenAPI Specification](https://spec.openapis.org/oas/v3.2.1.html)).

The custom connector port is capability-oriented and versioned. It must expose `discover`, `verifyIdentity`, `read`, `preview`, `execute`, `reconcile`, and `health` only where applicable, plus cancellation, bounded pagination, typed failures, provenance, capability declarations, schema fingerprinting, idempotency and reconciliation semantics. `execute` is never called through a generic query interface. Adapter packages require explicit install, license/security review, pinned version, contract suite, egress declaration, and operator grant; no automatic plugin installation occurs from a model suggestion.

For private-network systems, support an optional customer-managed connector gateway only after its trust boundary is specified: outbound-only mTLS to the platform, local source secrets, signed/pinned connector packages, endpoint allowlists, revocation, and auditable upgrade. Do not require Kubernetes for this path; a container/Compose deployment is the first supported footprint. This gateway is a deployment profile, not a new permission authority.

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
- Business-file ingestion is a separate, user-visible workflow: enforce file type/size limits, malware scanning where deployable, extraction status, permission/retention, source hash, and page/section provenance. Extracted content and embedded instructions are untrusted. The Agent may propose ontology terms from authorized content, but a citation and confidence do not confirm business meaning.
- Every uploaded file is associated with uploader, workspace, explicit access scope, retention deadline, source hash, malware/extraction status, parser version and provenance. Only authorized users can retrieve the file/extract; ACL is checked before parsing into model context. In Compose, content uses an explicit persistent encrypted volume with permissions; production may configure an object-store adapter. Deletion tombstones and propagates to extracted text/indexes; failed deletion is visible and blocks further retrieval. The platform must not treat uploader identity alone as permission for every workspace member.

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

