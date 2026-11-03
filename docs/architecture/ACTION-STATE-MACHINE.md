# Action State Machine and Recovery Contract

**Version:** 0.1.0 · **Status:** Design specification; source-specific implementation required · **Updated:** 2026-11-03

## State definitions

| State | Meaning | Permitted next states |
|---|---|---|
| `draft` | Request is being composed; no source effect is authorized | `validated`, `cancelled` |
| `validated` | Package, schema, access and required business facts are currently valid | `previewed`, `blocked`, `cancelled` |
| `previewed` | Server produced canonical effect digest and precondition summary | `awaiting_confirmation`, `blocked`, `cancelled` |
| `awaiting_confirmation` | Requester must confirm this exact effect | `awaiting_approval`, `ready`, `expired`, `cancelled` |
| `awaiting_approval` | Required business approval is pending | `ready`, `rejected`, `expired`, `cancelled` |
| `ready` | All decisions and current access checks pass; action may be durably submitted | `submitting`, `blocked`, `cancelled` |
| `submitting` | Durable worker is calling/reconciling the source command | `succeeded`, `rejected`, `outcome_unknown`, `reconciling` |
| `succeeded` | Source evidence confirms the requested source transition | terminal |
| `rejected` | Source definitively rejected or business approver declined | terminal; new intent required to change effect |
| `outcome_unknown` | Source may have accepted but response/evidence is insufficient | `reconciling`, `manual_review` |
| `reconciling` | Read-only check or stable-key retry is resolving source outcome | `succeeded`, `rejected`, `outcome_unknown`, `manual_review` |
| `manual_review` | Automation cannot resolve safely; an operator must obtain evidence | `succeeded`, `rejected`, `cancelled` (with documented source evidence) |
| `blocked` | A prerequisite, permission, connector or policy changed | new intent only after correction |
| `expired` | Confirmation/approval or source precondition expired | new intent required |
| `cancelled` | Cancelled before source submission | terminal; after submission, cancellation is a separate source command |

Only server-side transitions are authoritative. Client events and Temporal workflow state are operational projections; the action ledger is the product record. Every transition uses expected version/compare-and-swap and appends an audit event.

## Invariants

1. `ready` implies a valid published release, current requester permission, current connection grant, required confirmed rules, exact confirmation digest, all required approvals, unexpired preconditions, and connector safety evidence.
2. `submitting` implies the intent and outbox were committed before the durable coordinator received work.
3. One idempotency key maps to exactly one canonical effect within the installation and action namespace. Reuse with changed parameters is a conflict.
4. Repeated submit returns the same operation; it never starts a parallel untracked side effect.
5. A timeout or worker crash after dispatch does not imply rejection. The state becomes unknown until reconciliation proves a result.
6. Revocation or release disablement before dispatch blocks submission. After dispatch, the runtime reconciles and prevents new effects; it cannot promise to undo the source effect.
7. Authorization has a dispatch-time linearization point, but no platform can revoke an already accepted remote request atomically across systems. Once the source call may have been sent, the platform reports and reconciles the outcome instead of claiming cancellation.
8. Retrying is allowed only when the connector's declared source key/lookup behavior proves it safe. “HTTP retryable” is not equivalent to “business action retryable.”
9. A compensation is a new, separately authorized business action, never silent rollback.

## Effect descriptor

The server builds a canonical descriptor containing: installation; actor principal reference; app/package/action release digests; source connection and operation version; opaque target reference; normalized arguments; business precondition/source version; required policy decision reference; and expiration. It excludes secrets and unnecessary free text. The descriptor digest is used for confirmation, approval, idempotency correlation and audit.

Human-readable summary is rendered from the same canonical descriptor and must show consequential fields. If a field is omitted from display but changes the effect, the effect is not ready for confirmation.

## Transaction and outbox

Within one PostgreSQL transaction: recheck intent version and authorization result reference; persist the ready intent, exact effect digest and outbox event with a unique key; commit. An outbox dispatcher delivers an idempotent workflow-start request. If delivery repeats, Temporal workflow ID/idempotency is stable and the action ledger uniqueness constraint returns the existing operation.

Temporal workflow orchestrates timers, waits, retries after known-safe result, and reconciliation. Activity calls are small and idempotent where possible. Never put source credentials or large business payloads in workflow history; retrieve a narrow encrypted/reference payload at activity time and recheck authorization.

## Failure matrix

| Failure point | Ledger state | Recovery |
|---|---|---|
| Before local transaction commits | No accepted intent/operation | Client retries with same idempotency key |
| After commit, before workflow starts | `ready` plus undispatched outbox | Dispatcher retries start; uniqueness prevents second operation |
| Before source request is sent | `submitting` then known not sent | Retry with same operation key if connector evidence confirms no send |
| Source definitively rejects | `rejected` | Display source-safe reason; changed request creates a new intent |
| Source accepts; response is lost | `outcome_unknown` | Query by stable source key; do not repeat create blindly |
| Source has no query/key and response is ambiguous | `manual_review` | Operator checks source; attach evidence and resolve with explicit decision |
| Database unavailable after source accepts | Unknown on restart / workflow history | Reconcile source using durable operation correlation and repair ledger idempotently |
| User cancels after dispatch | Current operation continues reconciliation | Cancellation request is explicit; report that source state may already have changed |

## Source capability declaration

A connector must state whether it supports: stable client key; source-side deduplication duration; lookup by that key; conditional write/version check; cancellation; authoritative result query; and business approval/state lifecycle. The action validator maps the combination to allowed behavior. High-impact command without stable idempotency or authoritative reconciliation is manual-only.

## Automation mode contract

The immutable action definition names exactly one mode: `read_only`, `prepare_only`, `requester_confirmed`, `approval_required`, `guarded_autonomous`, or `manual_only`. The published policy additionally binds the mode to environment, actor/role scope, impact class, allowed target and value bounds, freshness/completeness predicates, business rules, request budget, expiry, separation-of-duty, and connector safety evidence. Runtime policy may become more restrictive immediately; relaxing it requires a new reviewed policy revision and release/promotion path.

`guarded_autonomous` is valid only when a named business owner and authorized publisher approve deterministic, testable preconditions and bounded impact, and the connector supports the required idempotency/reconciliation. It is disabled for unknown/conflicting facts, stale/partial inputs beyond declared thresholds, policy service failure, permission uncertainty, schema drift, effect changes, or unresolved outcomes. Model confidence, model-generated rationale, AG-UI events, or Skill/MCP text cannot select or upgrade a mode. A policy simulation reports expected routing over test cases but cannot publish or authorize runtime execution.

