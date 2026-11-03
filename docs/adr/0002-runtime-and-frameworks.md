# ADR-0002: Reuse ObjectStack and Select the Runtime Stack

- **Status:** Proposed pending TP-02 qualification
- **Date:** 2026-11-03
- **Requirements:** PR-04, PR-05, PR-10, PR-14
- **Backlog:** TP-02

## Context

The product's hardest engineering surface overlaps with an existing open project: typed business metadata, actions, permissions, generated REST/UI, MCP and plugins. Rebuilding those primitives as a second ontology/application kernel would be expensive and risks inconsistent permissions. The maintainer is working primarily with AI coding tools and needs an ecosystem that supports modular TypeScript development.

## Decision

**Preferred route:** qualify and adopt the open-source ObjectStack runtime as the product's base for object/action metadata, security primitives, SQL driver, REST/metadata interfaces, and MCP/UI packages where each passes TP-02. Add platform-specific plugins for task-first setup, source capability discovery/mapping, provenance/readiness, Agent-provider isolation, canonical effect/action ledger, durable reconciliation, and controlled release experience. Use PostgreSQL as its data store, React/TypeScript console, pnpm/Turborepo monorepo, OIDC enterprise identity, and Temporal for durable side-effect orchestration behind a narrow adapter.

The platform MUST NOT create a parallel object/action/permission/UI metadata engine. Its extension schema is limited to facts ObjectStack does not own: evidence and rule-decision status, source capability verification, freshness/partial/budget metadata, action idempotency/reconciliation evidence, effect digest, and release linkage.

At research time, the ObjectStack repository identifies Apache-2.0 framework packages and MIT UI packages, describes a plugin architecture and SQL/PostgreSQL runtime, and documents security, audit, approvals, MCP, and ObjectUI packages. These capabilities are strong fit signals, not proof of enterprise readiness. Its current public community is small and the codebase is evolving quickly. Do not depend on commercial/ObjectOS-only features or multi-organization packages; v1 is one organization per install.

## Why not build our own kernel first

A custom Nest/Fastify + Drizzle platform would give more familiar control, but it would reimplement the very object/action/UI/permission layer that creates the desired consistency. It remains the fallback only if a documented ObjectStack spike proves a central incompatibility that cannot be fixed by a narrow plugin without forking core semantics.

## Why not use an Agent builder as the kernel

Dify is a capable workflow/RAG/agent platform and is useful as a reference for onboarding and provider breadth. Its product center is LLM application composition, not the source-authoritative object/action/permission kernel required here; its project license also has additional terms that need review for redistribution/hosting. It may be integrated as an external Agent surface later, but is not the system-of-record execution kernel.

OpenSPG/KAG are relevant for knowledge construction and retrieval/reasoning over large domain knowledge bases. They are not the default transaction/action and generated task-app kernel for the first release. Consider them only for a demonstrated knowledge-heavy use case.

AG-UI is considered an interaction protocol, not a product engine. Temporal is considered for durable orchestration, not business truth or authorization. MCP is a transport/integration standard, not a trust or permission model.

## Qualification gate and pass/fail criteria

TP-02 must use a pinned release rather than floating `main` and record actual command output and package-by-package license evidence. Pass only if all these conditions hold:

1. A clean clone installs and starts a minimal ObjectStack + PostgreSQL host from supported documentation.
2. External OIDC can identify enterprise users; test the chosen auth plugin against the customer's expected IdP semantics. Production is not gated on local email/password auth.
3. Default-deny object, field and record permission behavior is understandable, testable, and enforceable through REST, client, MCP and extension paths.
4. Generic CRUD routes can be disabled or made unable to bypass named source business actions.
5. A plugin can add task evidence, readiness and source mapping without forking or replacing core metadata, authz, or query semantics.
6. Read-only PostgreSQL and HTTP/OpenAPI adapters can meet query budgeting, provenance, and row/field scope needs or are cleanly extendable through documented driver ports.
7. React metadata rendering supports a controlled component catalog, or the console can use it without a competing generated UI schema.
8. Temporal worker can persist and recover a source-command simulation without storing sensitive source payloads in workflow history.
9. Backup, restore, upgrades, supported Node versions and dependency licenses fit the project's self-hosted support goals.

If any trust-boundary condition (2-6) fails, reject ObjectStack for the affected runtime role and document a single replacement in a superseding ADR before implementing dependent capabilities. Do not maintain two competing cores.

## Consequences

The product design has a concrete reuse-first stack and a bounded qualification task. Until that task passes, the design is detailed but no implementation team should assume the framework adapter is proven. Exact versions are selected and lockfile committed in TP-02. Do not quote repository popularity as proof of quality.

## Reconsider when

The framework license changes, critical plugins become unavailable or incompatible, security boundaries require a fork, upstream maintenance slows materially, or measured upgrade effort outweighs reuse.

