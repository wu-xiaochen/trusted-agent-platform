# API and Extension Contract

**Version:** 0.1.0 · **Status:** Design baseline · **Updated:** 2026-11-03

## API principles

- API is a stable interface to business capabilities, not a remote database console.
- Use `/api/v1` and OpenAPI 3.1. Breaking changes require `/v2` or a documented compatibility window.
- Authenticate at the boundary and resolve identity server-side. Never trust a client-supplied actor, role, tenant, source grant, or approval result.
- Validate every request and response against a runtime schema. Reject unknown fields for security-sensitive commands.
- Use RFC 9457-style `application/problem+json` errors with stable `code`, safe `detail`, `correlationId`, and optional field errors. Never return stack traces, source credentials, SQL text, or model internals.
- Long operations return `202 Accepted` with an operation ID and status URL. Use SSE for updates; the authoritative state is always retrievable with `GET`.
- Paginate with opaque cursors, stable ordering, documented limits, and bounded filters. Do not expose raw SQL, arbitrary source filters, or unbounded graph traversal.

## Core resource groups

| Group | Example endpoints | Capability |
|---|---|---|
| Task templates and drafts | `GET /task-templates`, `POST /task-drafts`, `PATCH /task-drafts/{id}` | Configure task draft and clarification answers |
| Connections | `POST /connections`, `POST /connections/{id}:verify`, `GET /connections/{id}/capabilities` | Admin-owned setup and source readiness |
| Connector catalog | `GET /connector-types`, `POST /connections:import`, `POST /connections/{id}:discover`, `POST /connections/{id}:test`, `GET /connections/{id}/support-report` | Import an API description/collection or configure a known adapter; discovery and sample calls are bounded, and support tier is explicit |
| Business files | `POST /business-files:upload`, `GET /business-files/{id}`, `POST /business-files/{id}:extract`, `DELETE /business-files/{id}` | Upload a bounded file with an explicit access scope; inspect extraction/provenance and delete it under retention policy |
| Domain packages | `POST /packages/{id}/validate`, `POST /packages/{id}/publish`, `GET /releases/{id}` | Validate and publish immutable contract |
| Ontology workbench | `POST /packages/{id}/proposals`, `GET /packages/{id}/evidence`, `POST /packages/{id}/mappings:validate`, `POST /packages/{id}/tests:run` | Create evidence-linked proposals, inspect mappings, and run synthetic/read-only validation |
| Queries | `POST /apps/{appId}/queries/{capabilityId}:execute` | Execute bounded, authorized query |
| Runs | `POST /apps/{appId}/runs`, `GET /runs/{runId}`, `GET /runs/{runId}/events` | Start/read a conversational or task run |
| Actions | `POST /action-intents`, `POST /action-intents/{id}:preview`, `POST /action-intents/{id}:confirm`, `POST /action-intents/{id}:submit` | Server-resolved effect lifecycle |
| Approvals | `POST /approvals/{id}:decide`, `GET /approvals` | Separate business approval queue |
| Applications | `POST /app-specs:validate`, `POST /app-specs/{id}:publish`, `GET /apps/{id}/releases/{releaseId}` | Validate/release ObjectStack-native view metadata and a narrow app-composition manifest; no parallel object/action/permission/view schema |
| App release/deployment | `POST /apps/{id}/releases:build`, `GET /apps/{id}/releases/{releaseId}/artifact`, `POST /apps/{id}/releases/{releaseId}:promote` | Build immutable OCI/static artifact and promote the same digest between environments; no secrets or grants are embedded |
| Automation policies | `POST /actions/{actionId}/policy:simulate`, `POST /actions/{actionId}/policy:publish`, `GET /actions/{actionId}/policy` | Simulate and version human/automation gates; only authorized owners/publishers can publish policy |
| Extensions | `POST /extensions`, `POST /extensions/{id}:verify`, `POST /extensions/{id}:grant` | Register, inspect, and grant MCP/Skill capabilities |
| Operations | `GET /health/live`, `GET /health/ready`, `GET /operations/{id}` | Health and durable operation status |

These are contract shapes for implementation. Avoid implementing all endpoints as generic CRUD before the business service boundary is defined.

## Action contract

### Create intent

`POST /api/v1/action-intents` requires:

```json
{
  "appReleaseId": "rel_...",
  "actionId": "maintenance.submit-request",
  "targetRef": "opaque-business-reference",
  "arguments": {"partId": "PART-008", "quantity": 2}
}
```

The client supplies an `Idempotency-Key` header. The server scopes that key to installation, authenticated principal, action and time-retention policy; validates the release, schema, role, capability grant, current source identity, policy, source preconditions and mapping; then normalizes values and persists an intent. Reusing the same key with the same canonical request returns the existing resource; the same key with different content returns `409 IDEMPOTENCY_KEY_REUSED`. Retain the key at least as long as the source's deduplication and reconciliation window.

### Preview and confirm

Preview returns a server-generated effect descriptor containing target, operation, normalized impact fields, source, package/app versions, precondition summary, and digest. The UI renders it. Confirmation is a distinct authenticated request; the server records actor, timestamp, digest, expiry, and policy revision. A client boolean or hidden form field never stands in for the record.

### Approval and submit

If policy requires a business approval, a different authorized principal approves that exact digest. Submit rechecks current user permission, current grant, release status, source credential scope, approval validity, idempotency/reconciliation capability, and source precondition. It then creates a durable coordinator workflow and returns `202` with operation ID. Submit is rejected if approval expired, effect changed, user revoked, or connector readiness changed.

## Error codes (initial registry)

`UNAUTHENTICATED`, `FORBIDDEN`, `CAPABILITY_NOT_GRANTED`, `PACKAGE_NOT_PUBLISHED`, `PACKAGE_INVALID`, `RULE_UNCONFIRMED`, `SOURCE_UNVERIFIED`, `SOURCE_SCHEMA_CHANGED`, `SOURCE_UNAVAILABLE`, `STALE_DATA`, `PARTIAL_RESULT`, `BUDGET_EXCEEDED`, `EFFECT_CHANGED`, `CONFIRMATION_EXPIRED`, `APPROVAL_REQUIRED`, `APPROVAL_EXPIRED`, `IDEMPOTENCY_KEY_REUSED`, `OUTCOME_UNKNOWN`, `RECONCILIATION_REQUIRED`, `MANUAL_REVIEW_REQUIRED`, `VALIDATION_FAILED`, `RATE_LIMITED`, `DEPENDENCY_UNAVAILABLE`.

Document which errors are retryable by clients; clients do not retry `OUTCOME_UNKNOWN` blindly.

## SSE / AG-UI boundary

The run event stream uses named, versioned events with `runId`, monotonically increasing `sequence`, `occurredAt`, and a typed payload. Reconnection supports `Last-Event-ID`; clients refetch current state if a gap is detected. Do not emit secrets or raw retrieved documents by default.

AG-UI is an event-based, bidirectional connection between Agent backends and user-facing clients; it can carry lifecycle, text, typed UI intent/state, tool handoff and human-interrupt interactions. It is not the canonical app definition, authorization kernel, or deployable application package. The platform's release input is qualified ObjectStack-native view/component metadata plus, only if required, a narrowly validated app-composition manifest; AG-UI is an optional stream/interaction adapter. A2UI or similar declarative widget protocols may be evaluated as a transport/rendering aid, but native metadata validation and platform permissions remain authoritative. Platform capability requests remain typed service calls. A front-end event that says “tool approved” or “action succeeded” is informational only until the API ledger confirms it. This separation follows AG-UI's own positioning as the Agent↔User interaction protocol, while distinguishing generative UI specifications such as A2UI ([AG-UI overview](https://docs.ag-ui.com/introduction)).

## MCP exposure and consumption

- The platform MCP server exposes stable read/query and action-intent tools, derived from published capabilities and the same authz kernel.
- Follow the current stable MCP protocol revision that the selected official SDK implements; at this design review the protocol changelog listed 2026-07-28. Pin the SDK and protocol compatibility in the release matrix.
- A state-changing MCP tool can create a preview/intent, but confirmation and business approval use the same authorization/effect-binding lifecycle as the web API.
- MCP HTTP server is an OAuth resource server, not a token issuer. Validate token issuer/audience/scope and protected-resource metadata; map the authenticated subject to a user or explicitly scoped service principal. Unknown identity is denied. Do not forward the MCP bearer token to a source system or supply a shared administrator token to a model.
- External MCP servers are registered by URL/transport, owner, allowed tool IDs, schemas, auth method, egress target, timeout, data class, and review version. Tool metadata is treated as hostile input and does not receive authority by declaration.
- Disable `stdio` process launch from the product server in v1. Support explicitly configured remote transports through a constrained proxy; require explicit admin opt-in before future local process support.

## Skills

A Skill is an immutable, reviewable instruction/evidence bundle with ID, version, publisher, license, supported product versions, data classification, and package capability references. Loading it does not grant a capability. Skills cannot supply secrets, override system policy, publish packages, confirm actions, or invoke arbitrary shell/runtime code. Each Skill is version-pinned in a published release and scanned for secret-like content and disallowed commands.

