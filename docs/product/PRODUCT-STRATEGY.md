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
2. **One executable contract.** The release pins ObjectStack-native metadata for objects, relations, rules, queries, actions, permissions and views, then adds only evidence, source mappings, connector safety and app-release references that it does not own. The same server-side contract governs web, API, Agent and MCP.
3. **Convenient through guided work, trusted through enforceable boundaries.** AI can propose mappings, rules, and layouts. A human can inspect the evidence and approve business meaning. The server resolves identity, permission, effect, approval, and source capability.
4. **Connect existing systems without claiming magic.** Read-only API and database access are useful starting points. Writes use source-owned business commands. Missing APIs, identity context, or reconciliation support are explicit readiness blockers.
5. **Prove one workflow before generalizing.** Deliver maintenance preparation and spare-parts request submission across a work-order system and inventory system. Then validate that the same kernel supports an employee equipment-request task.
6. **Self-hosted enterprise deployment first.** One installation serves one organization. Shared multi-tenant SaaS, complex tenancy isolation, and Kubernetes are postponed until real demand justifies them.

## Positioning and differentiation hypothesis

Position the project as a **verified business task app builder/runtime for existing enterprise APIs**. Its first wedge is turning an existing API into a permission-aware, testable task experience with visible evidence, human decisions and safe recovery. It is not a general-purpose chatbot builder, ETL platform, data lake, ontology research environment, arbitrary workflow canvas, or autonomous device-control system.

The differentiation hypothesis is a measurable reduction in the time and specialist effort needed to go from a business task to a maintained, controlled application. The product should show the user what is connected, what the source can do, which rules are confirmed, which paths require approval, and what happens after an uncertain result. This hypothesis is not yet proven by customer research.

### Core competitive capability and strategic goal

The project's core competitive capability is to turn a selected cross-system business task into a **verified, permission-aware, operable task application**: business evidence and source capabilities are mapped to one reviewed model; each read and action is checked against the current principal and source scope; source writes use source-owned business commands with effect-bound confirmation/approval; and duplicate or uncertain outcomes are reconciled before a retry. People, conventional applications, Agents, APIs and approved MCP surfaces use the same server-side capability boundary. Published model, Agent and application artifacts are immutable and reusable across task experiences.

The strategic goal is to prove this complete path on real, supported enterprise interfaces and show that it reduces task setup time and specialist effort without hiding work transferred to the customer. The advantage should compound through tested connector compatibility and identity modes, reusable domain task packages, business-owner-reviewed evidence and exception cases, and measured execution/recovery behavior. These assets become a defensible position only when customers use and reuse them; architecture or feature presence alone is not proof of differentiation.

**Competitive position:** ObjectOS already offers a broad executable-ontology and business-application runtime, including metadata-driven objects, actions, permissions, flows, Agents and external database federation. This project builds on the qualified ObjectStack foundation and must not claim those primitives as unique. Its differentiation hypothesis is a stronger focus on completing and operating bounded cross-system tasks with explicit source capability verification, current authorization, source-owned writes and unknown-outcome recovery, then proving the result through domain-specific deployments and measured setup/operation effort. These are areas of emphasis and qualification, not claims that ObjectOS cannot support them.

Semantica is centered on graph-native context, ontology, provenance and reasoning. It may inform or supply an isolated proposal-generation capability, but it does not replace this project's business application and source-action runtime. Any such output remains an untrusted draft that must be checked against authorized evidence and the single published ObjectStack-native model.

**Proof required:** evaluate against the customer's current way of delivering the same task and against relevant platform alternatives. Record elapsed time and specialist touch time, task success, human corrections, source and identity coverage, denied-path results, duplicate/unknown-outcome recovery, and the effort to configure a second task without a kernel fork. Until connected customer trials establish these results, describe the position as a strategic hypothesis, not an achieved market advantage.

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
- Use the launch gates and adoption funnel in [OPEN-SOURCE-ADOPTION.md](OPEN-SOURCE-ADOPTION.md); prioritize independent successful use and distinct contributors over star count.

## Evidence required before expanding scope

Do not add a second durable workflow engine, ontology framework, policy language, or visual flow editor without evidence from at least two real task deployments. Do not claim that business users can configure the system unaided until observed sessions show they can identify blockers, review proposed rules, and correctly interpret operation states.


## Business objective and measurable acceptance

**Business objective:** reduce the time and specialist effort required for an enterprise solution architect to turn one cross-system business task into a tested, permission-aware, operable application, while preserving source-system authority and making every unsafe/unknown path visible.

**North-star measure:** time from a task owner selecting a supported task to the first validated, role-tested task application over real authorized read capabilities. Record both elapsed time and human touch time, with blockers/dependencies attributed to the party that owns them. Compare against the customer's documented current approach when one exists; do not claim improvement from an unmeasured baseline.

**Pilot acceptance (proposed targets, to be checked in formative research before public claims):**

- For a supported two-source read-only workflow, once API access, synthetic/approved sample data, and a business owner are available, target a useful tested task app within one working day and at least 30% less specialist touch time than a recorded comparable build baseline. This is a falsifiable hypothesis, not a measured claim.
- At least four of five formative solution-architect participants should reach an authorized sample read and explain the next blocker without maintainer rescue; report task completion, time, help requests, and critical misunderstandings individually as well as in aggregate.
- A solution architect can connect two supported source instances and complete a cross-source read workflow with no code changes to the platform, using standard UI configuration and mappings.
- One business owner can review evidence, confirm required meanings/rules, inspect at least one conflicting/unknown case, and correctly explain why a capability is blocked or ready.
- A requester can use the resulting traditional/Agent-assisted task UI and identify its data sources, freshness, next safe step, and whether an action needs confirmation/approval.
- All documented denied-path scenarios reject the unauthorized request; no test case completes a source write outside the authenticated action boundary. This is a release invariant, not a statistical target.
- The same kernel supports the second task domain without copying the permission/action runtime. External install and connector-extension feedback is recorded before a stable 1.0 claim.

The first three external task trials should test the time/effort hypothesis and reveal which hours belong to the customer, integration owner, business owner, or platform maintainer. Revise the target if a baseline proves incomparable; do not quietly redefine the measurement after seeing results. Until evidence exists, record metrics without a productivity claim. Product-market fit, GitHub ranking, universal compatibility, and zero customer effort cannot be guaranteed by design.
