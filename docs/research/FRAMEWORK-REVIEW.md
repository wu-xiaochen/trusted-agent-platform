# Framework and Product Reference Review

**Reviewed:** 2026-11-03 · **Purpose:** Select a maintainable open-source foundation for one-person-led enterprise platform work. This review is a time-bounded snapshot; recheck versions, license files, maintenance, and security before adding dependencies.

## Decision summary

The best fit to qualify first is **ObjectStack as the metadata/business-runtime foundation**, with narrow platform plugins for guided enterprise onboarding, source capability discovery and mapping, data provenance/readiness, action safety, and durable reconciliation. This recommendation is an inference from its documented architecture and the product overlap; it is not a claim that ObjectStack is already production-proven for this platform. The pass/fail gate is in [ADR-0002](../adr/0002-runtime-and-frameworks.md).

This choice avoids recreating objects, actions, permissions, generated service metadata, and component metadata in a competing kernel. It also reduces the amount a solo maintainer must build. ObjectStack's ecosystem and enterprise integration fit are the principal risks; a small vertical spike must settle them before product runtime work.

## Candidates

| Candidate | Strong fit | Gap for this product | Decision |
|---|---|---|---|
| ObjectStack | Typed object/action/UI metadata, plugin model, SQL runtime, permissions, REST/MCP integration and view tooling align with the shared business contract | Fast-moving, comparatively small ecosystem; OIDC fit, source connectors, forbidden generic CRUD paths, plugin stability, migrations and enterprise support need hands-on qualification; do not use ObjectOS-only components | **Primary foundation to qualify**; one superseding ADR if a trust-boundary criterion fails |
| Dify | Good reference for prompt/workflow/RAG authoring, provider breadth, evaluation and self-hosted packaging | Product center is LLM app composition rather than source-owned business actions and shared domain authorization; separate business kernel would still be needed; license has additional terms that require commercial/redistribution review | Reference product or later external Agent integration, not kernel |
| OpenSPG / KAG | Strong domain knowledge construction, schema-aware graph and hybrid retrieval/reasoning for knowledge-heavy data | Additional graph/knowledge infrastructure and a different use case than task-scoped operational action/app runtime | Optional future knowledge adapter if a real retrieval/reasoning need emerges |
| Temporal | Durable, long-running workflow execution and recovery primitives | Adds service and operational burden; workflow history and retries do not make external side effects exactly-once; source key/reconciliation still required | Preferred single coordinator for write-capable release after qualification |
| LangGraph.js | Checkpointing, resumable state and human interrupts for agent control flow | Agent checkpoint is not the action ledger, business authorization, or source reconciliation truth; framework-specific state can leak into product API | Optional harness adapter; keep agent state behind a port |
| AG-UI | Standardized agent/frontend event and interaction boundary | Event protocol does not own server authorization, release version, approval or action ledger; compatibility and version need a spike | Use if it meets the frontend event needs; keep platform domain event/API stable |
| MCP | Interoperable tools/resources/prompts surface | Tool metadata is untrusted; protocol OAuth is not enough for per-operation business policy | Use official SDK as a boundary adapter, with same kernel authz and governed capabilities |
| Salesforce Headless | Strong product reference for exposing business APIs, agents, MCP, skills and experiences across surfaces | Salesforce-specific governance and services cannot be assumed by a self-hosted multi-system open platform | Product pattern reference; reproduce the capability boundary, not proprietary implementation |

## ObjectStack qualification questions

1. Can the open framework's auth plugin federate real enterprise OIDC without replacing its authorization semantics with a custom bypass?
2. Can generic CRUD be fully denied for source-owned business data while object metadata remains useful for read queries and views?
3. Are permission checks consistently applied by REST, client SDK, MCP and custom plugins? Which code paths require explicit wrappers?
4. Does the SQL driver support the first supported PostgreSQL version, migration lifecycle, read-only external data integration, transactions and operations we need?
5. Can a custom plugin add evidence, rule-confirmation, freshness and reconciliation metadata while leaving core object/action ownership intact?
6. Is the component system safe for declared data-bound views and accessible confirmation? Can it publish without arbitrary code?
7. What is the actual supported package/license matrix? The repository indicates Apache-2.0 framework packages and MIT UI packages, while specific packages need individual review.
8. Can maintainers accept upstream changes without a fork? What is the recovery plan for a breaking release or reduced maintenance?

Any “no” for OIDC/security/CRUD bypass is a rejection for the affected runtime role, not a backlog item to quietly work around. Small UX gaps can be implemented as focused plugins.

## Reuse rules

- Select the smallest set of ObjectStack packages required by the proven vertical slice; do not install every plugin.
- Do not duplicate its object, field, relation, action, permission, query, or view definitions.
- Keep business readiness/evidence/action safety as narrowly scoped extension records that point to stable ObjectStack IDs.
- Audit every transitive license; do not copy Dify source into this project without legal review of its additional terms.
- Keep all framework IDs and metadata transformations behind an adapter so migration remains possible, but do not prematurely write a second full core.

## Evidence links

Primary sources are linked in [SOURCES.md](SOURCES.md). Repository stars and vendor claims are not used as proof of security or implementation quality. Framework evidence is confirmed through TP-02's executable spike and release/license inspection.

