# TP-02: ObjectStack Runtime Qualification

**Status:** Ready for a short architecture spike · **Milestone:** M0 · **Parent:** `docs/backlog.json` TP-02

## Outcome

Choose one product runtime foundation with evidence before a team builds the platform kernel. The preferred candidate is the open-source ObjectStack framework. The result is an accepted or superseding ADR-0002 and a minimal synthetic application that proves or rejects the critical trust boundaries.

## Scope

- Clone a pinned ObjectStack release/tag and capture commit/tag, package versions, Node/pnpm requirements, package license inventory, upstream release/activity and upgrade docs.
- Compose only required ObjectStack packages: object spec, runtime/core, SQL driver, server/REST, security, auth, audit, approvals, client/UI and MCP as needed for the spike. Document why each package is included.
- Boot one local application backed by PostgreSQL; do not use cloud/ObjectOS-only control-plane features.
- Configure one external OIDC test provider or a documented compliant test IdP. The development login path is not production proof.
- Define one synthetic work-order object, one read capability and one proposed business action. Add one task-evidence extension using stable object/action IDs.
- Probe every exposed route and SDK path for permission and generic CRUD bypass, including MCP and custom plugins.
- Simulate a Temporal worker action separately, including payload privacy, restart/replay and response loss. No real external write.
- Render a declarative UI view containing a user-confirmation preview using catalogued components. No model-generated code.

## Explicit non-goals

No actual customer data, secrets, public API promise, production connector, broad product feature, reusable custom ontology engine, permission system, generic workflow engine, or deployment guarantee. Do not fork upstream during this spike.

## Procedure

1. Record baseline environment (OS/architecture, Node, pnpm, Docker/PostgreSQL), exact pin and checksum/source reference.
2. Start minimal host from a clean checkout using upstream-supported commands; record missing or undocumented steps.
3. Confirm which packages are Apache-2.0, MIT, commercial-only, or transitive; exclude anything not clearly reusable in the public project.
4. Test authentication: issuer/audience validation, session behavior, user identity mapping, revocation and OIDC logout/session expiry behavior.
5. Test authorization: positive and negative object/field/record reads through REST, client, custom plugin, MCP, and server internals. Attempt direct create/update/delete for a source-owned business object; prove disabled or prove the action gate cannot be bypassed.
6. Test source connector contracts: per-user vs service identity, narrow PostgreSQL read-only role, field filtering before Agent context, query limits, partial response and schema drift.
7. Test plugin extension: task evidence/readiness attach to ObjectStack metadata without duplicating object/action/permission schemas or depending on unstable private APIs.
8. Test UI: ObjectStack-native view/component metadata (plus only a narrowly scoped app-layout manifest if needed) rejects arbitrary script, unsafe import, unknown component, ungranted field and unbound action; effect is server-created. Record whether any required feature would force a parallel view/schema engine; that is a fail gate until a superseding ADR chooses one replacement core.
9. Test Temporal at-least-once delivery and source-commit/response-loss simulation. Demonstrate how the platform resolves unknown outcome; do not assert exactly-once remote effects.
10. Build/upgrade/restore instructions and estimated process/dependency footprint; list open issues and upstream support channel.
11. Write result in `docs/research/OBJECTSTACK-QUALIFICATION.md`; update ADR-0002 as accepted or create superseding decision. Record evidence and unresolved risks in backlog/progress.

## Pass/fail

Pass only if OIDC identity mapping, default-deny permissions, generic CRUD containment, extension seam, migration lifecycle and package licenses meet ADR-0002. UI niceties can remain limited if the controlled renderer is safely extensible. Any authz or bypass failure is a stop condition. If failed, document the smallest replacement architecture and why; do not keep ObjectStack and a custom core as co-equal sources of truth.

## Acceptance evidence

- Reproducible bootstrap from a clean checkout with pinned dependencies.
- Package/license matrix and support/dependency map.
- Permission-path matrix with actual deny results.
- OIDC identity and service-identity/delegation notes.
- Proof generic write surfaces are unavailable for source-owned records.
- Extension/API/UI/source integration findings.
- Temporal no-sensitive-history and unknown-outcome findings.
- Updated accepted/rejected ADR, revised roadmap if needed, and open risks with owners.

