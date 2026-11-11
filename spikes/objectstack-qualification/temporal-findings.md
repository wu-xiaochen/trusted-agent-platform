# G13/G14 — durable action coordination findings

## Framework surface

ObjectStack 18.2.0 provides durable *application* automation
(`@objectstack/service-automation`: flows with record/schedule/api
triggers, flow runs, approvals plugin, record-change triggers, a queue/job
service) but does not ship the cross-service saga coordinator the trusted
agent platform needs: a canonical effect digest, requester/approver
binding, outbox, idempotent source-command keys, and
unknown-outcome/reconcile state for an EXTERNAL system of record. ADR-0005
therefore keeps Temporal as the platform-side coordinator behind the
named action. The spike validates the *contract* that coordinator must
keep — with a deterministic fake source, no Temporal dependency needed to
prove the invariants, and no real external write.

## Executable simulation

[`../durable/durable-coordination.sim.mjs`](../durable/durable-coordination.sim.mjs)
models the platform adapter against a fake source keyed by an operation id:

| Scenario | Measured result |
|---|---|
| ledger intent + outbox commit BEFORE dispatch | one transaction (`JsonStore.tx`); no side effect precedes the durable boundary |
| successful commit then confirm | `succeeded`, outcome stored with source ref |
| duplicate delivery of the same deterministic key | `duplicate:true`, SAME effect; fake source saw exactly **1** commit |
| response lost AFTER commit → reconcile by query, no blind retry | `unknown_manual_review` while the query fails; once the query answers, `succeeded` with the original ref; source commit attempts stay at 1 (and 2 across two distinct operations) |
| reconcile query failure | state `unknown_manual_review`; coordinator alone owns retry; no second POST |
| worker restart (new process, journal reloaded from disk) | duplicate delivery returns the stored outcome; **0** new source attempts |
| timeout BEFORE the source commits | state `retry_wait`; later dispatch commits exactly once |
| sensitive argument canary `CANARY-DURABLE-SECRET-9931` | asserted absent from the durable journal, outbox and history in every state; only an opaque `argsref-…` handle persists |

```
$ node durable/durable-coordination.sim.mjs
durable coordination simulation passed: {"sourceAttempts":2,"sourceQueries":2,
 "states":{"WO-N-1|PART-008|2":"succeeded","WO-N-1|PART-011|1":"succeeded"}}
```

## How it maps onto the ObjectStack named action

- The action handler itself already implements the first idempotency layer:
  a deterministic effect key `SR-<work-order>-<part>-<qty>` and a dedupe
  read (`idempotent:true` on repeat REST/MCP calls was measured live — see
  permission matrix).
- The ledger/outbox and reconciliation state live in PLATFORM tables
  (the design's `action_intents`, `outbox_events`), committed in one
  PostgreSQL transaction by the worker before calling the source-facing
  command; ObjectStack's named action is the source-of-truth boundary the
  worker invokes, not the saga store.
- A real source integration must expose (or the platform adapter must
  wrap) a stable operation key plus a query-by-key API, and distinguish
  "unknown/timed out" from "accepted"; when the source lacks query
  support, unknown outcomes route to manual review by policy.

## Temporal-specific conclusion

The patterns ADR-0005 relies on (at-least-once delivery, workflow id =
idempotency key, activities as the only side-effect callers, history as
replay log) were validated at contract level. Before production adoption
the platform team still needs an actual Temporal dev-server rehearsal
for: history size/retention under retries, signal-based human approval,
and worker deployment sizing. None of these changes the trust boundaries
qualified here; they are operational acceptance tests for TP-12.
