# Executable Domain Package Contract

**Version:** 0.1.0 · **Status:** Design specification · **Updated:** 2026-11-03

## Purpose

A package turns a task-specific understanding into the shared contract used by the kernel, UI, Agent and MCP. It is deliberately bounded so a business owner can review it and the runtime can validate it. It does not replace source data, provide a general-purpose knowledge graph, or let a model write executable rules.

## Canonical package shape

The following is conceptual and will be formalized in JSON Schema/Zod during TP-04. IDs are stable within a namespace; content is canonicalized before digesting.

```json
{
  "schemaVersion": "1.0.0",
  "packageId": "maintenance-preparation",
  "packageVersion": "0.1.0",
  "status": "draft",
  "title": "Prepare maintenance and spare-parts request",
  "sources": [{"id":"work-orders","connectionRef":"conn_...","authority":"maintenance-source"}],
  "objects": [{"id":"work-order","title":"Work order","fields":[]}],
  "relationships": [{"id":"work-order-equipment","from":"work-order","to":"equipment","cardinality":"many-to-one"}],
  "rules": [{"id":"quantity-positive","status":"confirmed","ownerRef":"principal_...","predicate":{"op":"gt","left":{"field":"quantity"},"right":{"number":0}}}],
  "queries": [{"id":"maintenance.find-work-order","inputSchema":{},"outputSchema":{},"sourcePlan":[],"budget":{}}],
  "actions": [{"id":"maintenance.submit-request","inputSchema":{},"sourceOperationRef":"work-orders.create-request","requiredRuleIds":["quantity-positive"],"confirmation":"required","approvalPolicyRef":"policy_...","retryContract":{}}],
  "application": {"routes":[],"components":[]},
  "provenance": {"createdBy":"principal_...","evidenceRefs":[]}
}
```

## Field and rule semantics

Each field declares stable ID, scalar/value type, required/nullability, sensitivity (`public`, `internal`, `confidential`, `restricted`), source mapping, display label, and retention classification. Numeric values declare precision and unit where relevant. Time values declare instant/date/timezone semantics. Relationship fields declare stable endpoint types, cardinality, join key mapping, and authority. A source field is not exposed just because it was discovered.

Rules carry one of `extracted`, `suggested`, `unknown`, `conflict`, or `confirmed`; source evidence; scope; owner; revision; and one bounded predicate or reviewed validator reference. A required rule may be `confirmed` only by the authorized business owner. Free text is not a machine-checkable predicate and cannot enable automatic execution.

## Query and action schemas

Queries are bounded named operations. Define input/output JSON Schema, allowed filters/sorts, source plan, max rows/bytes/time/parallel calls, freshness window, partial failure policy, returned sensitivity, and provenance. Do not include arbitrary SQL in the published package.

Actions are named source-owned business commands. Define typed input, source operation and mapping revision, required rules, preconditions, preview renderer, canonical effect fields, user confirmation, optional business approval policy, source idempotency key, source result query/reconciliation rule, retry classification, timeout, and audit categories. `retryClassification` is one of `safe-with-stable-key`, `safe-after-reconcile`, or `manual-only`; validator rejects mismatch between claim and connector evidence.

## Draft-to-release lifecycle

```text
draft → linted → simulated → reviewed → published → disabled → superseded
```

- **Draft:** AI/human can propose edits; nothing runs as an approved production capability.
- **Linted:** schema, reference graph, schema compatibility, and safety rules pass.
- **Simulated:** fixture cases cover required success, negative and ambiguity conditions.
- **Reviewed:** named roles confirm business rules, source mapping, access scope, and publication diff.
- **Published:** immutable digest becomes addressable to a runtime and app release.
- **Disabled:** new runs/actions stop; audit remains. In-flight side effects require reconciliation.
- **Superseded:** newer release exists; historic runs still refer to their exact old release, subject to current authorization and retention.

## Canonicalization and compatibility

Normalize object keys and semantically unordered sets; preserve ordered steps and display ordering where meaningful. Normalize numbers, unit/time values, and defaults before computing an effect digest. JSON floating point for monetary or measurement effect fields is prohibited unless exact decimal representation is specified.

Every published package stores `schemaVersion`, `packageVersion`, canonical JSON, content digest, author/owner decisions, referenced source/mapping revisions, and publication timestamp. A schema migration preserves old definitions for historical runs and has an explicit forward migration. A semantic change to action meaning or required rules is a major package version change.

## Validator errors

Stable error IDs include `DUPLICATE_ID`, `UNKNOWN_REFERENCE`, `TYPE_MISMATCH`, `UNCONFIRMED_REQUIRED_RULE`, `SENSITIVE_FIELD_UNDECLARED`, `UNBOUNDED_QUERY`, `UNSAFE_ACTION_RETRY`, `MISSING_RECONCILIATION`, `UNAPPROVED_SOURCE_OPERATION`, `INVALID_APP_BINDING`, `UNSAFE_EXPRESSION`, and `INCOMPATIBLE_SCHEMA_VERSION`. Errors identify a JSON pointer and remediation role without leaking source payloads.

