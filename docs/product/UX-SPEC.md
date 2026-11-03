# Task-Centered UX and Generated Application Specification

**Version:** 0.1.0 · **Status:** Design baseline · **Updated:** 2026-11-03

## Design principles

1. Lead with the task outcome and a working example; explain concepts only when the user needs to make a decision.
2. Separate what the platform observed, what AI inferred, what a person confirmed, and what the source system verified.
3. Show the most important blocker and its owner before asking the user to configure more settings.
4. Use progressive disclosure: business meaning first; protocol, identity, mapping, and operational detail when requested.
5. Keep read, preview, submit, approval, and recovery visually distinct. Never hide an external side effect inside a generic chat answer.
6. Make the same task understandable in a generated app, a direct API client, an Agent conversation, and an audit view.

## Information architecture

- **Workspace:** overview, installations, members, audit and health.
- **Build:** task templates, task drafts, source connections, business package, test cases, app studio, release.
- **Use:** published task apps, assigned work, approvals, run history, and recovery queue.
- **Manage:** identity provider, connector credentials, source grants, model providers, extension registry, retention, backup and system health.

Business users mainly see Build task drafts, Use apps, and approvals. Advanced integration and security controls stay in Manage and are permission-gated.

## Guided builder screens

### 1. Outcome

Ask: “What should be true when this task is complete?” Offer templates with a short preview and required roles/systems. Ask for a sample case only after a template is chosen. Sample data should default to synthetic data.

### 2. Business terms

Show proposed objects and relationships as editable cards with source evidence. User-facing statuses are `From your material`, `Suggested`, `Needs confirmation`, `Conflicting information`, and `Confirmed`. Do not display internal ontology jargon as the only way to understand the page.

The business terms workspace is a visual evidence workbench: a graph view for objects/relationships, a mapping table from source fields to business terms, a rules/exceptions list, a revision diff, and a test evidence panel. Users can switch between visual and form views; neither requires writing an ontology language. Every proposed item opens its supporting file passage, schema field, or sample record. Agent proposals remain marked as suggestions until the business owner confirms them. Conflicting definitions are shown side by side with impact and owner, never silently merged.

### 3. Systems and access

For each source: business name; system owner; connection status; identity/delegation mode; available operations; data scope; last verification; rate/size limits; and known gaps. Credentials are entered only in a secure connection setup view and stored by reference. Do not present secrets back to the browser after save.

The onboarding wizard accepts a supported API description/collection, an endpoint plus manual schema, database connection profile, or approved business file. It shows a support tier before setup and walks the admin through inspect operations → choose auth mode → enter credential into a secret reference → run a safe test → select capabilities → map business meaning. Test requests are bounded and use an administrator-selected sample/read operation; write operations are never run as connection tests. The report distinguishes network reachability, identity verification, schema discovery, read test, and command safety. Unsupported auth/protocol details name the custom connector route.

### 4. Rules and exceptions

Use a plain-language rule, one representative example, and the consequence if the rule is unknown. Ask the right named role to confirm it. Distinguish user confirmation (“I want this submitted”) from business approval (“This request meets policy”).

### 5. Test cases

Run against synthetic fixtures first. A result panel presents the answer, provenance, timestamps, truncation/partial status, rules applied, and capabilities exercised. A preview cannot submit. The UI must never label a preview as a successful business operation.

The validation workbench groups checks into contract, mapping, rule, authorization, freshness/completeness, and action-safety cases. Users can use Agent-suggested positive, negative, and edge tests, but a business owner accepts expected business results. “Try with connected data” is explicitly read-only, scoped to the current user's access, and indicates whether it used fixtures, a sample, or a live query. A dry run cannot invoke an action connector's `execute` port.

### 6. Application studio

Generate a useful first draft automatically using ObjectStack-native view/component metadata after TP-02 qualifies its renderer. Allow edits to page order, headings, permitted fields, and task instructions through that native model. A project-owned manifest may fill only a demonstrated app-level composition gap and references native IDs; it cannot become another view, field, or permission schema. Do not expose arbitrary JSX, JavaScript, SQL, or unrestricted tool definitions. Every binding points to a published native view/query/action ID.

The studio supports conventional work pages (search/list, record detail, guided form, task inbox, approval, status/history, and bounded report) alongside Agent surfaces (conversation, evidence panel, proposed plan, clarification, tool progress, confirmation and escalation). Generated pages are editable through the component/layout editor and remain bound to the same business package. AG-UI streams the Agent experience where selected; it does not define or compile the page. The release preview simulates each role and viewport before publish.

### 7. Readiness and publish

Use a capability matrix, not a scalar score:

| Capability | Example state |
|---|---|
| Read work order | Ready · source verified · current user allowed |
| Read inventory | Ready with freshness window · last verified at time |
| Prepare request | Ready as draft · unresolved approval rule |
| Submit request | Blocked · source lacks safe retry/reconciliation contract |
| Publish app | Ready for named publisher · package revision shown |

Every blocked state identifies the missing evidence and whether the next action belongs to the business owner, source administrator, or publisher.

For each action, show its configured mode (`read-only`, `prepare-only`, `requester-confirmed`, `approval-required`, `guarded-autonomous`, `manual-only`), rationale, boundaries, test coverage, and owner. A policy simulator shows which cases auto-run, pause for requester confirmation, enter approval, or stop, with the exact guard that determined the path. The publish review pins native metadata, narrow app manifest if needed, component renderer catalog, task package envelope, connector contracts, automation policy and API compatibility versions. It creates a signed/digested immutable release artifact; promotion reuses the same artifact digest. Environment secret references, grants, OIDC and current permissions are injected at runtime, never captured in the artifact.

### 8. Operate and recover

The task app includes a progress header, relevant business facts and provenance, a clear next action, and a timeline. Terminal and uncertain states remain distinct: `Completed`, `Rejected`, `Needs attention`, and `Outcome unknown`. Recovery offers reconcile, contact owner, or safe retry only when the connector says the same request can be retried.

## Component catalog contract

Initial component kinds to qualify: `object-summary`, `field-list`, `table`, `form`, `rule-status`, `source-evidence`, `action-preview`, `confirmation-panel`, `approval-panel`, `operation-status`, `timeline`, `alert`, and `help`. Reuse ObjectStack/ObjectUI component metadata where available. The project registry only maps an approved native component type to a reviewed React renderer; it is not a second component schema. Each component contract declares:

- a stable native component type and compatible runtime/catalog version;
- allowed inputs, outputs, size and sensitivity classifications;
- bound query/action capability IDs;
- validation and empty/error/partial/loading states;
- accessibility labels and localization keys;
- whether it can display sensitive values or request a business confirmation.

`confirmation-panel` receives a server-built effect descriptor. A client cannot set an `approved=true` property or substitute the action parameters after approval. Publishing validates all component schemas and references.

## Interaction and visual behavior

- Use an event timeline for async work and a persistent “what happens next” status.
- Keep source provenance adjacent to the facts it supports; allow a detail panel to explain source, retrieval time, freshness, and transformations.
- Stale and partial data have text and icon indicators, not color alone.
- Confirmation uses a plain summary of target, amount/quantity, key parameters, source system, and consequence; the final button names the action (“Submit request”).
- Ask for approval after presenting the exact submitted effect, not while the Agent is still changing it.
- Use SSE for run/timeline updates with a visible reconnect state. The UI fetches current state again after reconnect.
- Do not use a chat transcript as the only way to review facts, policy decisions, approvals, or recovery steps.

## Usability acceptance

A user unfamiliar with the product can discover the sample task, run its read-only demo, and explain what would need to change before submit. A person with approval authority can distinguish their approval from the requester’s confirmation. After reconnect, a user can identify whether the operation completed, remains in progress, or has an unknown source outcome.

The onboarding acceptance exercise should include one OpenAPI-described service and one source without a machine-readable API description. Record time to first authorized read, mapping corrections, blockers understood, and whether the admin correctly distinguishes “reachable” from “ready.” Do not publish a universal compatibility claim based on one connector.

