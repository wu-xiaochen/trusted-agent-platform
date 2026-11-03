# Roadmap and Delivery Gates

**Baseline:** 2026-11-03 · This is a proposal with exit criteria, not a promise of calendar dates.

| Milestone | Goal | Included work | Exit gate |
|---|---|---|---|
| M0 · Design baseline | Shared decisions and developer workflow | Product strategy/PRD/UX, business/system/data/API/security architecture, repo and API conventions, ADRs, backlog, research log | Team can start TP-02 without inventing a conflicting auth/data/action model |
| M1 · Guided synthetic task | Demonstrate the user journey without customer credentials | Maintenance task template, synthetic work-order/inventory fixtures, draft package, readiness UI and test-case viewer | Target user understands the task, source limitations, stale/partial, and why submit is blocked |
| M2 · Verified read integration | Securely connect real read-only systems | OIDC, connection catalog, HTTP/OpenAPI read connector, PostgreSQL read-only connector, provenance and budgets | Two source instances can be connected/configured and read through the same package with authorization evidence |
| M3 · Governed task app and Agent | Reuse one service from a bounded app and agent | `AppSpec`, component registry, query kernel, single-agent runtime, AG-UI stream, platform MCP read tools | UI, Agent and MCP produce the same authorized results and cannot bypass policy |
| M4 · Trusted business actions | Safely request a source-owned business command | Action ledger, canonical effect, confirmation/approval separation, Temporal, idempotency, reconciliation and manual review | Fault/replay exercise passes; connector with no safe reconciliation cannot submit automatically |
| M5 · Self-hosted preview | Make a solution architect able to install and demo | Docker Compose, OIDC guide, secret setup, backup/restore, health/operations view, release package | Clean-machine install; upgrade/restore and security review evidence documented |
| M6 · External validation | Prove reuse outside the sample | Second domain (employee equipment request), external install feedback, connector contribution path, eval suite | Second domain uses the same kernel; external developer can extend a connector from docs |

Avoid calendar estimates until TP-02 and TP-03 are complete. Each milestone is a deployable or inspectable vertical increment. Prioritize M1 and read-only M2 evidence before any autonomous write feature.

## Release ladder

- **0.x design/alpha:** synthetic data and explicit limitations; schema/tooling may evolve.
- **0.x read-only preview:** real connections only through explicitly supported adapters, no business writes.
- **0.x action preview:** effect generation and approval UI are simulated or source sandbox only.
- **0.x controlled write preview:** one low-impact source business command with durable coordinator, connector-specific safety evidence and supervised use.
- **1.0:** only after external installation, upgrade, security, recovery, accessibility and support evidence.

