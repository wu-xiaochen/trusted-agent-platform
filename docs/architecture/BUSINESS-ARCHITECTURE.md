# Business Architecture

**Version:** 0.1.0 · **Status:** Design baseline · **Updated:** 2026-11-03

## Business capability map

| Capability | Product responsibility | Business authority |
|---|---|---|
| Task framing | Templates, examples, structured intake, clarification | Business owner defines intended outcome |
| Domain package | Versioned objects, relations, rules, queries, actions, app bindings | Business owner confirms semantics; platform validates contract structure |
| Source access | Discover and map permitted system capabilities | Source owner/admin grants identities and operations |
| Read service | Resolve query against mapped sources and enforce current access | Source systems remain authoritative for source facts |
| Agent planning | Interpret intent, ask clarifying questions, propose approved service calls | Model has no identity, policy, approval, publish, or source-write authority |
| Action governance | Preview, bind, confirm, approve, submit, reconcile, audit | Requester confirms intent; designated approver decides business approval |
| App generation | Compose task UX from approved components and bindings | Publisher approves a version; runtime rechecks current access |
| Operations | Monitor connectors, runs, queues, freshness, errors, and recovery | Customer operator owns production response and policy |

## The executable business package

The published application metadata is the shared boundary across interaction surfaces. ObjectStack is the preferred source for typed object, field, relation, action, permission, and view metadata, subject to TP-02 qualification. This project adds only the task-specific extension that metadata does not already represent: evidence/decision states, readiness, source-operation safety, canonical effect binding, and reconciliation. Never fork or duplicate ObjectStack object/action/permission semantics. This is not a universal knowledge graph or general OWL reasoner. The combined package references:

1. **Object type:** stable ID, business label, field schema, sensitivity, source authority, retention, and allowed references.
2. **Relationship:** stable ID, typed endpoints, cardinality, mapping rule, and validity/evidence policy.
3. **Rule:** ID, plain-language explanation, machine-checkable predicate or approved validator reference, scope, severity, owner, evidence, status, and test cases.
4. **Query capability:** inputs, output schema, allowed filters/sorts, source plan, freshness/partial-result semantics, sensitivity, and budgets.
5. **Action capability:** source business operation ID, typed input, preview semantics, required rules, effect descriptor builder, confirmation/approval policy, idempotency and reconciliation contract, and retry safety.
6. **Application specification:** routes, role visibility declarations, approved components, and capability bindings.
7. **Source mapping:** source system, resource, field mapping, identity mode, authority ranking, transforms, and version.

## Ontology authoring and verification lifecycle

The user builds a task-sized executable model through an evidence workbench, not a blank ontology editor. Inputs are imported source schemas, approved sample records, data dictionaries, process documents, forms, and user explanations. The Agent produces proposals for objects, relations, field mappings, units, constraints, rules, and action meaning. Every node and mapping has a provenance class: `source_observed`, `agent_proposed`, `owner_confirmed`, `conflicting`, or `unknown`, plus source/file/page/path references and revision. Confidence is a triage hint only; it never changes the provenance class or publish permission.

The visual workbench provides (a) object/relation graph, (b) source-to-business field mapping table, (c) rule and exception editor, (d) impact/dependency view, (e) revision diff, and (f) test/evidence panel. Validation is layered: structural schema and reference checks; mapping type/unit/nullability checks; required business-owner confirmation; data sensitivity and permission checks; bounded-expression and resource checks; capability/readiness checks; and positive, negative, edge, stale, partial, and denied-access cases. A dry run may read only authorized sources or synthetic fixtures and evaluates mappings/rules without a command port. Publish creates an immutable package digest only after required gates pass. A failure report points to the exact object, relation, mapping, rule, case, or permission decision and names the resolving role.

This workbench deliberately keeps model extraction separate from runtime semantics. The model may draft a package, but only the server validator determines whether it is structurally valid; only the business owner confirms meanings; only the administrator grants a source; only the publisher releases a tested revision.

The platform extension is validated together with ObjectStack metadata: references resolve; types line up; required rules are defined; UI binds only to declared capability IDs; required approval roles exist; source identity and action safety are evidenced. `draft` and `published` releases are separate. A published release is immutable and records both ObjectStack metadata digest and platform-extension digest; changes create a new version.

Do not allow model-authored JavaScript, SQL, regular expressions with unbounded runtime, policy scripts, or arbitrary connector code inside a package. If computed rules are needed, add a small, typed, resource-bounded expression language with a reviewed grammar and versioned semantics.

## Domain ownership and command model

- A read capability can compose source reads but cannot mutate source state.
- A business action invokes a named source business API or explicitly approved command adapter. Generic database `INSERT`, `UPDATE`, or `DELETE` is never exposed as an Agent capability.
- The source system owns its state machine. Platform approval does not override source authorization, validation, or approval.
- Cross-system orchestration is a named business process with explicit compensation/reconciliation behavior; it is not implied by an Agent making several tool calls.
- When a workflow spans systems without an atomic transaction, show each step and the possibility of partial completion. Define a compensating command only when the business owner and source support it.

## Role and decision model

Initial platform roles: `workspace-admin`, `integration-admin`, `solution-architect`, `business-owner`, `publisher`, `requester`, `approver`, `operator`, and `auditor`. Roles grant platform capabilities; tenant/user attributes and package scopes further restrict access. A person may hold multiple roles, but one identity session is used to make an auditable decision.

Decisions are separate and attributable:

- **Business rule confirmation:** the owner confirms a proposition and scope.
- **Publication:** publisher approves a specific package and app digest.
- **User confirmation:** requester confirms one server-resolved effect at the point of submission.
- **Business approval:** authorized approver authorizes that effect under a policy.
- **Source authorization:** connection identity is permitted to perform the source operation.

No one decision silently implies another. For high-impact operations, enforce separation of duties in policy (for example, requester cannot approve their own request) and record the policy revision used.

### Automation modes per action

Each published action declares one of six modes, scoped by action and environment: **read-only** (no source mutation); **prepare-only** (Agent may draft/preview, a human performs the source action elsewhere); **requester-confirmed** (the authenticated requester confirms the server-resolved effect each time); **approval-required** (requester confirmation plus an authorized, separately attributable approver); **guarded-autonomous** (no per-run human confirmation only when a named owner has approved deterministic limits, predicates, source permissions, idempotency/reconciliation, and monitoring); or **manual-only** (the platform can explain and prepare but never submit).

The policy contains the reason/impact class, eligible actors, environment, amount/quantity/target limits, freshness and completeness requirements, required predicates, separation-of-duty rules, budget/rate limits, expiry, and connector safety evidence. The server evaluates policy before every transition and again at dispatch. The Agent can request a capability but cannot choose or weaken its mode. Model confidence cannot substitute for required evidence or a human decision. Missing policy service, stale/conflicting data, changed effect, unknown source outcome, connector drift, denied access, or failed reconciliation blocks automation. A simulator runs proposed policy against synthetic and historical redacted cases and reports path, unmet guard, and expected human step; a simulation is evidence for review, not approval.

## Canonical action lifecycle

```text
Draft → Validated → Previewed → Awaiting requester confirmation
     → Awaiting business approval (when policy requires)
     → Ready to submit → Submitting → Succeeded | Rejected | Outcome unknown
                                              ↓
                                      Reconciling → Succeeded | Rejected | Manual review
```

The server calculates a canonical effect from the immutable package, source operation, resolved object identifiers, normalized parameters, and source preconditions. It creates an effect digest. Confirmation and approval records bind to that digest, actor, target, release, policy revision, validity period, and connector/source identity. Any material change invalidates prior decisions. Immediately before source submission, the action service re-resolves current user permission and source grant.

Only one component owns retries for external side effects. A timeout after sending a request is ambiguous; it moves to `Outcome unknown`. The platform queries the source using an idempotency key or source business identifier. If it cannot distinguish accepted from rejected, it stops in manual review; it does not invite blind retry.

## Business readiness and ownership handoff

For each blocked capability show: missing prerequisite; evidence that is absent; who can resolve it; safe alternative; and whether existing published read-only capabilities remain available. Example: “Submit request is blocked because the source API does not support a stable operation key or a query for an accepted request. Integration administrator: request one from the system owner. You can still review and export a draft.”

This is the core convenience promise: help a customer understand the task and next steps while preserving real business and IT ownership.

