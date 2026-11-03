# Product Strategy

**Status:** Baseline for v0.x planning · **Date:** 2026-11-03 · **Owner:** Product maintainer

## Product in one sentence

Trusted Agent Platform helps an enterprise team turn one real business task across existing systems into a governed, reusable agent service and task application, without requiring business users to first become ontology or agent-platform experts.

## Target user and job

The first buyer/user is an enterprise or industrial solution architect working with a business owner and an integration administrator. The business owner knows the exceptions and desired outcome; the administrator controls identities and system interfaces; the architect translates between them. The platform should make their shared understanding visible and executable.

**Job to be done:** When a task depends on several existing systems, help me connect the authorized capabilities, make the business rules explicit, test realistic cases, and give people or agents a safe, usable way to complete and follow the task.

The product is aimed at teams that can provide approved API access and a business contact, but lack spare capacity to build a bespoke agent runtime, workflow, connector, authorization layer, and UI for each use case.

## Strategic choices

1. **Task-first setup.** Start with a task template and examples. The platform asks for only the facts, exceptions, interfaces, and permissions needed for that task. It does not ask the user to model the entire enterprise first.
2. **One executable contract.** A versioned domain package describes typed business objects, relations, rules, queries, actions, and UI bindings. The same server-side contract governs the web application, API, Agent tools, and MCP surface.
3. **Convenient through guided work, trusted through enforceable boundaries.** AI can propose mappings, rules, and layouts. A human can inspect the evidence and approve business meaning. The server resolves identity, permission, effect, approval, and source capability.
4. **Connect existing systems without claiming magic.** Read-only API and database access are useful starting points. Writes use source-owned business commands. Missing APIs, identity context, or reconciliation support are explicit readiness blockers.
5. **Prove one workflow before generalizing.** Deliver maintenance preparation and spare-parts request submission across a work-order system and inventory system. Then validate that the same kernel supports an employee equipment-request task.
6. **Self-hosted enterprise deployment first.** One installation serves one organization. Shared multi-tenant SaaS, complex tenancy isolation, and Kubernetes are postponed until real demand justifies them.

## Positioning and differentiation hypothesis

Position the project as a **guided, governed runtime for existing enterprise capabilities**. It is not a general-purpose chatbot builder, ETL platform, data lake, ontology research environment, arbitrary workflow canvas, or autonomous device-control system.

The differentiation hypothesis is a measurable reduction in the time and specialist effort needed to go from a business task to a maintained, controlled application. The product should show the user what is connected, what the source can do, which rules are confirmed, which paths require approval, and what happens after an uncertain result. This hypothesis is not yet proven by customer research.

Open-source success should be earned through a working, self-hostable vertical slice, reproducible evaluations, understandable documentation, and external reuse. GitHub Trending placement is an aspiration, not a delivery commitment; no design can guarantee a ranking.

## Outcome measures

Track task completion rather than generated artifacts:

| Outcome | Measure | Guardrail |
|---|---|---|
| Faster onboarding | Wall-clock time and human touch time from task selection to a tested draft | Report unavailable customer dependencies separately |
| Lower specialist burden | Number of concepts, manual mappings, and expert interventions required | Do not hide work transferred to IT or integrators |
| Correct understanding | Business-owner accuracy when explaining rules, exceptions, and task state | Test unknown, conflict, stale data, and partial results |
| Safe operation | Unauthorized effect attempts rejected; approval/effect binding; duplicate and unknown-outcome recovery | No aggregate “trust score” as a substitute for evidence |
| Reuse | Second task setup time; connector and domain package reuse without fork | Report changes that still require code |
| Community value | Independent installs, useful issues/PRs, connector reuse, and cited examples | Stars alone are not product validation |

## First release promise and exclusions

The first useful release should let a solution architect use a guided task template, connect at least one supported read source, define and verify a versioned business package, run a cross-domain read workflow, publish a controlled task UI, and operate it locally with auditable evidence. The controlled business write path follows only after source-specific action and reconciliation checks pass.

Explicitly out of scope for v1: arbitrary generated code, arbitrary SQL writes, unrestricted MCP tool execution, autonomous approval, zero-integration legacy transformation, enterprise-wide automatic ontology discovery, a general-purpose ETL/lakehouse, industrial safety control loops, shared SaaS tenancy, and a promise that every legacy interface is immediately connectable.

## Adoption and community strategy

- Lead with a synthetic, runnable maintenance/spares example and a short path from clone to task UI.
- Publish connector capability matrices and honest unsupported cases.
- Make the domain package and action lifecycle readable before requiring the user to understand the runtime internals.
- Keep contributions small: one connector, one task template, one evaluation case, or one focused runtime capability per change.
- Validate with industrial AI developers and solution architects before broadening the target audience.

## Evidence required before expanding scope

Do not add a second durable workflow engine, ontology framework, policy language, or visual flow editor without evidence from at least two real task deployments. Do not claim that business users can configure the system unaided until observed sessions show they can identify blockers, review proposed rules, and correctly interpret operation states.

