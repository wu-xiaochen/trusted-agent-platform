# Product Requirements

**Version:** 0.1.0 · **Status:** Design baseline · **Updated:** 2026-11-03

This document defines product behavior for the first end-to-end release. It does not assert that the behavior is implemented. Stable requirement IDs link to `docs/backlog.json`.

## Personas

- **Business owner:** defines the requested outcome, business vocabulary, rules, exceptions, and acceptable result. Can review and confirm business meaning, but does not configure infrastructure secrets.
- **Solution architect:** guides task setup, maps concepts to source capabilities, tests the package, and publishes an app version when granted that role.
- **Integration administrator:** configures OIDC, source connections, credentials, network access, and connector capability grants. Cannot silently approve business rules.
- **Operator / requester:** runs a published application, sees only permitted data and actions, confirms an exact requested effect, and tracks its outcome.
- **Approver:** approves a business decision under enterprise policy. Confirmation that the user intends to submit is a separate event.
- **Auditor:** inspects permitted run, decision, evidence, and action records without being granted execution ability.

## Main user journey

1. **Choose a task.** Select a task template and inspect a synthetic example. The template states the business outcome, required source capabilities, sensitive data, and expected blockers.
2. **Describe the task.** Use a short form or natural language. The assistant extracts proposed objects, relationships, constraints, desired outcomes, and unknowns. Every proposal can be traced to supplied material or marked as a suggestion.
3. **Connect capabilities.** An administrator authorizes a source using a configured credential reference and identity mode. The product checks connectivity, schema, read/write capability, pagination, freshness, and any needed reconciliation support. It never reports “connected” merely because a URL is reachable.
4. **Review the business package.** The solution architect and business owner confirm labels, mappings, rules, exceptions, and source-of-truth choices. Conflicts and unknowns remain visible. A required unresolved rule blocks only dependent capabilities, with the reason shown.
5. **Test a case.** Run a read-only preview with synthetic or explicitly authorized data. Show the contributing sources, timestamps, partial failures, applied mappings, and rule outcomes. Do not let a preview call a write operation.
6. **Compose the application.** Generate a draft from the package and a reviewed component catalog. Users can rearrange approved components and choose fields/actions they are authorized to publish. All submitted changes create an immutable new version after validation.
7. **Publish by capability.** The readiness page lists available, read-only, draft-only, confirmation-required, approval-required, and blocked capabilities. The publisher reviews the exact package, UI, connector, and policy revisions.
8. **Run and recover.** The application shows the task’s state, evidence, freshness, and next safe step. A source timeout after a possible write is `outcome unknown`, not success or failure. The runtime reconciles before offering a retry.

## Functional requirements

| ID | Requirement | Acceptance condition |
|---|---|---|
| PR-01 | Guided task creation | A first-time solution architect can create a draft from a template without being asked to define a global ontology or agent graph. |
| PR-02 | Evidence-backed proposals | Extracted, suggested, confirmed, unknown, and conflicting facts are distinct states with provenance and revision history. |
| PR-03 | Capability-aware connections | A connection reports verified protocol, identity mode, source resources, permissions, limits, freshness, and supported operations; missing features remain explicit. |
| PR-04 | Executable business package | Objects, relations, rules, queries, actions, data shapes, and UI bindings are versioned and validated as one dependency graph. |
| PR-05 | Shared server enforcement | Web, API, Agent, and MCP requests invoke the same server-side query/action services. Clients cannot directly perform a source write. |
| PR-06 | Read authorization and provenance | Authorization is evaluated before source results or retrieved content enter an LLM context. Results retain source and freshness evidence. |
| PR-07 | Safe action preview | A preview is derived by the server from the selected package and connector. It returns a canonical effect descriptor and cannot submit the effect. |
| PR-08 | Bound confirmation and approval | User confirmation is tied to a canonical effect hash, actor, package revision, expiry, and current permissions. Required business approval is separately authorized and auditable. |
| PR-09 | Durable action handling | Duplicate requests are idempotent; ambiguous source outcomes enter reconciliation; retries require known-safe connector semantics. |
| PR-10 | Controlled generated UI | Only catalog components, approved data bindings, and published capability IDs can be rendered. Arbitrary executable code is rejected. |
| PR-11 | Governed extensions | MCP servers and Skills are explicitly registered, reviewed, versioned, allowlisted, and invoked through platform authorization. Their descriptions do not grant privilege. |
| PR-12 | Honest readiness | Read, draft, preview, submit, and recovery readiness are displayed separately with actionable reasons. No single trust score substitutes for these states. |
| PR-13 | Audit and operations | Authorized operators can trace actor, request, package, policy, connector, effect, approval, source result, and recovery decisions with secret and content redaction. |
| PR-14 | Self-hosted operation | A documented local Compose deployment starts the platform, database, and durable coordinator with health checks, backup guidance, and explicit production configuration. |

## First task definition

**Maintenance preparation and spare-parts request** uses a work-order source and an inventory source. It can locate a work order, identify relevant equipment/part relationships, show stock with freshness/source, and prepare a request. The first write-capable release submits a request through the source system's business API. It does not claim the request is approved, that stock is reserved, or that a maintenance plan is safe to execute.

The example must include: no matching asset; ambiguous part mapping; stale inventory; partial source outage; insufficient stock; an unresolved approval rule; duplicate submit; source timeout after source acceptance; and source API without idempotency/reconciliation. Cases that cannot be safely completed stop and explain why.

## Non-functional requirements

- **Security:** least privilege; deny by default; no secrets in prompts, source payloads, browser storage, logs, public examples, or audit text.
- **Isolation:** one organization per deployment for v1. Every persisted domain row is associated with the installation/workspace context; do not advertise shared-tenant SaaS isolation.
- **Reliability:** write commands are durable, replay-safe, observable, and recoverable; a process restart cannot silently lose an action state.
- **Data integrity:** published packages are immutable; updates create new revisions. Source systems remain authoritative for their data and business transitions.
- **Usability:** errors name the unavailable capability and next owner/action. Unknown/conflict/partial/stale are first-class states, never silently converted to defaults.
- **Portability:** a developer can run the synthetic example from a clean clone without external enterprise credentials. Real connections require explicit setup.
- **Accessibility/localization:** keyboard navigation and screen-reader labels are required for task setup, approval, and status. UI strings are externalized; Chinese and English are the first supported locales.
- **Observability:** use structured logs, metrics, traces, correlation IDs, and redaction. Do not log complete business payloads by default.

## UX quality gates

Before a release claims convenience, observe at least five target users across business and solution-architect roles completing the synthetic task. Record task completion, critical errors, requests for help, and whether participants correctly understand stale, partial, awaiting approval, and unknown-result states. Five users is a formative usability gate, not statistically conclusive evidence.

