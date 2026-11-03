# ADR-0005: Durable Action Lifecycle and Single Coordinator

- **Status:** Proposed pending Temporal qualification
- **Date:** 2026-11-03
- **Requirements:** PR-07, PR-08, PR-09, PR-13
- **Backlog:** TP-11, TP-12, TP-13

## Context

Cross-system writes can commit at a source while the caller loses the response. Process-local retries, an Agent loop, and an independent workflow runner cannot safely agree on the effect or source truth.

## Decision

Create a platform-owned action intent and ledger. The application kernel computes canonical effect descriptors and makes confirmation/approval decisions. A single durable coordinator (Temporal is the proposed implementation) runs authorized commands and reconciliation. Only its action worker invokes a write adapter, with a narrow credential, explicit source idempotency/reconciliation contract, and current authorization check.

State transitions are explicit and persisted: draft, validated, previewed, awaiting confirmation, awaiting approval, ready, submitting, succeeded, rejected, outcome unknown, reconciling, manual review. Unknown source outcomes are never blindly retried. If the source has no safe idempotency key or reconciliation query, high-impact automatic submission is unavailable.

## Consequences

Temporal adds operational requirements and lock-in at the orchestration layer. Hide it behind a narrow coordinator port and avoid storing authoritative business decisions only in workflow history. PostgreSQL action ledger remains the platform business record. A source system retains the final business state.

## Reconsider when

TP-02 cannot demonstrate install, replay, visibility, retention, upgrade, and recovery behavior that fits supported self-hosting. Any alternative must demonstrate equivalent durable timers, deduplication, retries, cancellation semantics, observability, and tested crash recovery before replacing it.
