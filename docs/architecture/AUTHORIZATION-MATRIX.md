# Authorization Matrix

**Version:** 0.1.0 · **Status:** Design specification · **Updated:** 2026-11-03

## Principal and scope model

The authenticated principal is created only by the OIDC/API boundary or an explicitly configured service-client verifier. A principal includes immutable issuer/subject, installation ID, current platform roles, approved attributes, authentication strength/time, and delegated/effective source identity references. Model output, query parameters and MCP tool metadata cannot construct a principal.

The effective capability is the intersection of:

```text
authenticated principal
∩ platform role and attributes
∩ application release visibility
∩ published package capability grant
∩ source connection/identity scope
∩ source system's current authorization
```

Deny overrides allow. A missing/unknown attribute, expired grant, schema mismatch or unavailable authorization source denies high-impact actions. Read-only UX may show a restricted result without sensitive fields when the package explicitly supports it.

## Platform role matrix

`*` means only for the assigned installation and explicit scope. This table is a baseline; customers may narrow it. No role grants source permission automatically.

| Capability | Workspace admin | Integration admin | Solution architect | Business owner | Publisher | Requester | Approver | Operator | Auditor |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Manage OIDC, members, platform policy | ✓ | — | — | — | — | — | — | — | — |
| Configure connection and secret reference | ✓ | ✓ | — | — | — | — | — | — | — |
| Inspect source catalog/connection health | ✓ | ✓ | Scoped | — | — | — | — | ✓ | Read-only audit scope |
| Create/edit task draft and mappings | ✓ | Scoped | ✓ | Review/confirm business meaning | — | — | — | — | — |
| Confirm business rules | Scoped | — | Only if separately assigned owner | ✓ | — | — | — | — | — |
| Run read/test case | ✓ | ✓ | ✓ | ✓ | Scoped | Published-app scope | Scoped | Scoped | Read-only scope |
| Publish app/package | ✓ | — | — | Review required rules | ✓ | — | — | — | — |
| Request business action | Scoped | — | — | — | — | ✓ | — | — | — |
| User confirmation | — | — | — | — | — | ✓ for own request | — | — | — |
| Business approval | — | — | — | — | — | — | ✓ under policy | — | — |
| Reconcile / manual resolution | — | — | — | — | — | — | — | ✓ with source evidence | Read-only |
| Read audit trail | ✓ | Scoped | Scoped | Scoped | Scoped | Own permitted run | Scoped | Scoped | ✓ scoped |

High-impact policy may require requester/approver separation and rule owner/publisher separation. Workspace admin can administer grants but must not silently satisfy a business decision requirement unless explicitly authorized by the customer's policy.

## Decision table

| Request | Identity and authorization point | Additional condition |
|---|---|---|
| Read a query capability | API entry and source call | Filter row/field scope before result enters app/model; enforce time/byte/row budget |
| Retrieve document or time-series data | Before retrieval and before context assembly | Current source ACL, classification allowed by selected provider, bounded time/window |
| Draft a task or AppSpec | Current editor role | Model-generated draft is untrusted and cannot create grants |
| Confirm a rule | Confirming principal and rule owner at write | Evidence, rule revision and scope recorded; required owner role |
| Publish package/app | Publisher at publish transaction | Required rules confirmed, references valid, source grants ready, digest and review recorded |
| Preview action | Current requester and action scope | Read-only preview may query source; no source command |
| Confirm an effect | Requester at confirmation | Exact effect digest, target, release, expiry and current role |
| Approve | Authorized approver at decision | Exact digest; separation-of-duties policy; approval expiry |
| Submit command | Recheck immediately before dispatch | Source identity scope, policy, approval, idempotency and reconciliation contract |
| MCP tool call | Resource server validates OAuth token; then kernel per capability | Correct audience/issuer/scope; no bearer token forwarded to connector |
| Agent internal call | Per-run workload identity plus original user/delegation context | Worker token is not a user token; actor context is signed/bound by API and validated |
| Reconcile result | Operator or durable worker with operation scope | Evidence must come from source query or approved manual resolution |

## Delegation modes

- **User-delegated:** connector obtains/uses source access explicitly tied to the user. Revocation or expiry prevents further access. Audit records the user and source principal.
- **Installation service identity:** the enterprise administrator grants a service account a narrow source scope. The platform records requester and effective service principal separately. It cannot claim user-level source authorization; application policy must authorize on behalf of the requester and the enterprise must accept that operating model.
- **Unconfigured/unknown:** access denied.

Never let the API silently replace a failed user token with a more privileged service identity. Credential refresh and identity-mode transitions are explicit administrative changes and invalidate relevant approvals.

