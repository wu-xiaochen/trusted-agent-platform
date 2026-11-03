# Roadmap and Delivery Gates

**Baseline:** 2026-11-03 · This is a proposal with exit criteria, not a promise of calendar dates.

| Milestone | Goal | Included work | Exit gate |
|---|---|---|---|
| M0 · Design baseline | Shared decisions and developer workflow | Product strategy/PRD/UX, business/system/data/API/security architecture, repo and API conventions, ADRs, backlog, research log | Team can start TP-02 without inventing a conflicting auth/data/action model |
| M1 · Guided synthetic task | Demonstrate task framing and first package validation without customer credentials | Maintenance task template, synthetic work-order/inventory fixtures, draft package, readiness UI, and synthetic test-case viewer | Target user understands the task, source limitations, stale/partial states, required business confirmations, and why submit is blocked |
| M2 · Verified integration and evidence workbench | Connect supported read-only systems and build a task-sized model from approved evidence | OIDC, connector support report/onboarding, HTTP/OpenAPI read connector, PostgreSQL read-only connector, bounded business-file ingestion, ontology proposals/mappings, visual validation, provenance and budgets | One API-described and one manually configured source can be safely tested and read; owner distinguishes source facts/AI proposals/conflicts; publish blocks on failed required checks |
| M3 · Governed task app and Agent | Reuse one service from conventional and Agent-facing surfaces | `AppSpec`, component registry, query kernel, single-agent runtime, AG-UI interaction adapter, platform MCP read tools | UI, Agent and MCP produce the same authorized results; generated UI cannot bypass policy; AG-UI is not mistaken for AppSpec or authorization |
| M4 · Trusted business actions | Safely request a source-owned business command under explicit automation policy | Action ledger, per-action modes/simulator, canonical effect, confirmation/approval separation, Temporal, idempotency, reconciliation and manual review | Each mode's scenarios pass; source writes always use action boundary; unsupported reconciliation blocks automation; fault/replay exercise passes |
| M5 · Self-hosted and frozen task apps | Install, operate, and promote an immutable generated application | Docker Compose, OIDC guide, secret setup, backup/restore, health/operations view, OCI/static release artifact and environment promotion | Clean-machine install; same digest promotion; upgrade/restore; secret isolation; current permission revocation; security review evidence documented |
| M6 · External validation | Prove reuse outside the sample | Second domain (employee equipment request), external install feedback, connector contribution path, eval suite | Second domain uses the same kernel; external developer can extend a connector from docs |
| M7 · Data-shape and private-network extensions | Expand industrial compatibility only when field evidence justifies the operational cost | Typed graph/time-series read adapters and optional customer-managed private-network connector gateway | Unit/time/quality and ACL semantics pass connector tests; gateway threat/revocation review passes; these extensions are not 1.0 launch prerequisites |

Avoid calendar estimates until TP-02 and TP-03 are complete. Each milestone is a deployable or inspectable vertical increment. TP-02 is a hard framework gate; TP-03 validates the synthetic task and user assumptions. Prioritize M1 and read-only M2 evidence before any write feature. Within each milestone, execute one TP at a time; do not treat future PR requirements as available before their owning TP is done.

## Release ladder

- **0.x design/alpha:** synthetic data and explicit limitations; schema/tooling may evolve.
- **0.x read-only preview:** real connections only through explicitly supported adapters, no business writes.
- **0.x action preview:** effect generation and approval UI are simulated or source sandbox only.
- **0.x controlled write preview:** one low-impact source business command with durable coordinator, connector-specific safety evidence and supervised use.
- **1.0:** only after external installation, upgrade, security, recovery, accessibility and support evidence.

