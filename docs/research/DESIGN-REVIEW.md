# Design Risk Review

**Review date:** 2026-11-03 · **Scope:** Product and architecture documents in this repository · **Result:** Baseline is coherent enough to proceed to TP-02, but not proof of implementation security or customer fit.

“Perfect” cannot be demonstrated for a design with untested frameworks, integrations and users. This review names the highest-impact design risks, confirms the mitigations now specified, and keeps unresolved assumptions visible. It is not a code audit, penetration test, legal opinion, or security certification.

## Findings and design changes

| Risk | Severity before correction | Design resolution | Residual evidence required |
|---|---|---|---|
| Rebuilding a framework's object/action/permission engine while also adopting it creates two sources of truth and permission bypasses | Critical | ObjectStack is the preferred single metadata runtime; platform adds only narrow evidence/readiness/action-safety extensions. TP-02 fails closed if core authz or CRUD containment cannot be proven. | Verify permission paths across REST, client, MCP, custom plugin and generic CRUD routes in pinned version. |
| “Service-layer ontology” could be only a schema while each UI/tool uses a different execution path | Critical | Published capability IDs resolve through the same ObjectStack/business-service kernel for Web/API/Agent/MCP; no browser-to-source or agent-to-adapter route. | Build one capability across all four interfaces and test denied paths. |
| Service account access may masquerade as user delegation | Critical | Explicit delegated vs installation-service identity modes, effective principal audit, no silent fallback, narrow grant intersection. | Verify IdP and connector identity propagation in target enterprise systems. |
| A generic ObjectQL/REST/MCP CRUD endpoint could bypass action approvals and ledger | Critical | Generic source writes disabled/gated; source changes require named business command and intent lifecycle. Explicit TP-02 gate. | Inspect actual framework route registration and negative tests; do not assume a security plugin covers custom paths. |
| “Exactly once” or blind retry after remote timeout is impossible to guarantee without source cooperation | Critical | Action ledger/outbox plus one durable coordinator; unknown outcome and reconciliation; source dedupe/query evidence required; no promise of atomic cross-system transaction. | Fault-injection exercise after source commit, response loss, worker/database restart and duplicated delivery. |
| User approval can be invalidated by a parameter edit, policy change, or revocation | High | Canonical server effect digest, separate confirmation/approval, expiry/release binding, dispatch-time authorization. | Canonicalization/replay/concurrency tests; document in-flight revocation limit. |
| Temporal history can persist secrets or sensitive business arguments | High | Store minimal references/digests in workflow history, fetch encrypted args inside worker, explicit retention/TLS/access review. | Scan workflow history with canary secrets and production-shaped synthetic records. |
| Authorized data can be exfiltrated via prompt injection/provider retention | High | Field/doc filtering before model, explicit provider egress/classification policy, no restricted data by default, no credential in prompt, user-visible provider setting. | Provider-specific data handling and network-egress review; adversarial source content test. |
| MCP protocol/token scopes could be mistaken for business authorization | High | OAuth resource-server validation and protected-resource metadata; map identity to kernel, check each tool, do not forward bearer tokens. | Confirm 2026 protocol revision + official SDK feature flags and test scope escalation/issuer mix-up. |
| Generated UI may execute arbitrary code or claim permission based on hidden buttons | High | Versioned AppSpec, allowlisted component registry, strict binding validation, server-side current authz, no eval/dynamic imports. | Fuzz schema/renderer and inspect generated asset CSP and dependency loading. |
| Federated query, caches, vector indexes and projections can survive source revocation/deletion | High | Federation first; projections require explicit scope, watermark, deletion/revocation state, current authorization and retention. | Measure deletion lag and prove reauthorization on cache/index reads. |
| Framework operations and multi-process local install may be too heavy for small integrators | Medium | Modular monolith, one organization per install, Compose first, no K8s/shared SaaS by default, qualify installation/backup/upgrade. | Clean-machine install with a solution architect and minimal admin skills. |
| Broad platform ambition may delay visible value and harm developer adoption | High | One maintenance vertical slice, read-only first; second task tests reuse; WIP=1 and feature exclusions. | User sessions and an independent connector contributor exercise. |
| “Top 20” or “best UX” may create an untestable success promise | Medium | Treat ranking as aspiration; use install/reuse, task completion, safe recovery, contribution and user comprehension measures. | Track public and user evidence without presenting vanity metrics as business value. |

## Additional controls required in implementation

1. Workload identity and internal TLS between API, Agent worker, and action worker; each has distinct scopes and egress policy.
2. Fail-closed authorization on missing data, unknown attributes, missing policy service, connector drift and stale grants.
3. Content-security policy and no remote code in generated AppSpec rendering.
4. Use non-sensitive audit references and constrain database roles; export high-value audit to customer-controlled immutable storage when required.
5. Pin versions, inspect each package license (including UI and transitive assets), produce an SBOM, and qualify upgrades before adopting framework releases.
6. No marketing claim of certification, universal legacy integration, or source-side exactly-once behavior without external evidence.

## Open design assumptions to validate

- Business owners can review small examples and plain-language rules without modeling the entire ontology.
- At least some target customers expose a read API or scoped database view and an explicit source business action for one workflow.
- Their source identity model permits either user-delegated access or a customer-approved narrow service identity.
- ObjectStack's plugin/auth/SQL/UI packages can be operated without closed ObjectOS dependencies or a maintained fork.
- A task-centric declarative UI component set handles most first-task screens without requiring arbitrary customer code.
- The target user accepts local single-organization deployment and manages their own IdP, source credentials and model endpoint.

These are product/technical hypotheses, not hidden blockers. If evidence contradicts one, update the PRD and ADR before expanding code.

