# ADR-0009: Per-Action Automation Modes and Policy Simulation

- **Status:** Proposed
- **Date:** 2026-11-03
- **Requirements:** PR-07, PR-08, PR-20
- **Backlog:** TP-11, TP-20

## Context

Customers need to decide which business actions can run automatically and which require a requester, approver, or manual handling. A single Agent autonomy setting or model confidence score cannot represent business impact, source safety, human authority, freshness, and recovery requirements.

## Decision

Each action has one explicit mode: read-only, prepare-only, requester-confirmed, approval-required, guarded-autonomous, or manual-only. Policy binds mode to actors, environment, impact, target/value bounds, business predicates, evidence freshness/completeness, permissions, budgets, connector idempotency/reconciliation, expiry and separation of duties. The server evaluates it before transitions and at dispatch. Any unknown, stale/conflicting, revoked, drifted or unreconciled state blocks automation. A simulator evaluates policy against cases but does not publish or grant authority.

## Consequences

Autonomy is configured and reviewed per action/environment, not for an entire Agent. Guarded autonomy is opt-in and available only for deterministic bounded conditions and source operations with suitable deduplication/reconciliation. Raising or relaxing a mode requires a new immutable policy revision and authorized approval.

## Security/data impact

Models, prompt content, MCP/Skill metadata, UI state, event streams and confidence values cannot change the configured mode or manufacture a decision. Every chosen path records its policy revision, guards and actor/service identity. Runtime authorization is separate from business approval and source authorization.

## Validation evidence and reconsideration

Test each mode against success, denied, missing, stale, conflicting, expired, policy-service failure, connector drift, duplicate, and unknown-outcome cases. Review this taxonomy with business owners in pilot sessions before enabling guarded autonomy in a release.
