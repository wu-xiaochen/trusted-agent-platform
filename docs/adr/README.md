# Architecture Decision Records

ADRs preserve the reason for decisions that shape packages, data/security boundaries, API compatibility, or operational cost. Create one for a major dependency, public contract, source identity mapping, state machine, or deployment model.

## Status vocabulary

- **Proposed:** review or an experiment is required before implementation depends on it.
- **Accepted:** decision is approved and may be implemented; verify the stated conditions.
- **Superseded:** a later ADR replaces it; keep the record and link the replacement.
- **Rejected:** evaluated and declined; state evidence and reconsideration trigger.

## Required sections

Context, decision drivers, considered options, decision, consequences, security/data impact, validation evidence, owner, and reconsideration trigger. Link the affected requirements and backlog IDs. Never silently change an accepted security boundary; record the new decision and migration path.

## Index

| ADR | Title | Status |
|---|---|---|
| [0001](0001-modular-monolith-and-single-org.md) | Modular monolith and one organization per install | Proposed |
| [0002](0002-runtime-and-frameworks.md) | Runtime and framework selection | Proposed pending qualification spikes |
| [0003](0003-executable-domain-package.md) | Bounded executable domain package | Proposed |
| [0004](0004-data-federation-and-projections.md) | Federation-first data access and bounded projections | Proposed |
| [0005](0005-durable-action-coordination.md) | Durable action lifecycle and single coordinator | Proposed pending Temporal spike |
| [0006](0006-agent-ui-and-extension-boundary.md) | Controlled Agent UI, MCP, and Skills boundary | Proposed |
| [0007](0007-connector-onboarding-and-compatibility.md) | Connector onboarding and compatibility tiers | Proposed |
| [0008](0008-appspec-release-artifact.md) | Native task views and immutable application release artifact | Proposed |
| [0009](0009-action-automation-modes.md) | Per-action automation modes and policy simulation | Proposed |
| [0010](0010-typed-graph-and-time-series-contracts.md) | Typed graph and time-series read contracts | Proposed for post-v1 qualification |
| [0011](0011-private-connector-gateway.md) | Customer-managed private connector gateway | Proposed for post-v1 qualification |

