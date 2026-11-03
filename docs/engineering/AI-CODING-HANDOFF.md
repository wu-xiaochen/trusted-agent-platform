# AI Coding Team Handoff Contract

**Status:** Required execution contract · **Updated:** 2026-11-03

This document turns the product design into a controlled engineering handoff. It is not a prompt to generate the whole platform in one pass. The product contains security-critical boundaries and unqualified runtime choices; implementation must proceed through the stable backlog IDs and evidence gates.

## Handoff truth

- The repository is a design baseline with a small static-contract foundation, not a running trusted Agent platform.
- **The only current first engineering task is TP-02, the runtime qualification spike.** Do not build product runtime features against ObjectStack until TP-02 passes and ADR-0002 is accepted.
- TP-02 is an investigation and synthetic prototype. It does not authorize customer data, source writes, production deployment, or a broad framework fork.
- No design guarantees a one-shot AI implementation, secure behavior without adversarial tests, universal connector compatibility, or GitHub Trending placement.
- A task marked `planned` is not automatically implementation-ready. The task must satisfy the Definition of Ready below before an AI coding agent starts it.

## Source of truth and precedence

When requirements appear inconsistent, stop and resolve the conflict in documentation before changing trusted behavior. Use this order:

1. User-approved task scope and repository `AGENTS.md` development contract.
2. Product intent and acceptance: `docs/product.md`, `docs/product/PRD.md`, `docs/product/UX-SPEC.md`.
3. Security and business authority: `docs/architecture/THREAT-MODEL.md`, `docs/architecture/AUTHORIZATION-MATRIX.md`, `docs/architecture/ACTION-STATE-MACHINE.md`.
4. Accepted ADRs and qualified framework contracts. Proposed ADRs are options, not implementation facts.
5. Relevant architecture and the task's TP specification.
6. `docs/backlog.json` stable ID, dependencies, acceptance and evidence location.
7. This handoff contract and `docs/engineering/IMPLEMENTATION-GUIDE.md`.

An ADR cannot override a higher-level user requirement silently. A lower-level document cannot weaken a higher-level safety invariant. Record a decision and update every affected canonical document before coding a newly discovered contract.

## Non-negotiable coding rules

1. Keep WIP at one product task. One AI coding agent owns one TP at a time; do not parallelize dependent work or start a second TP while the first is in progress.
2. Implement only the named TP and its explicitly listed prerequisites. Do not infer permission to deliver adjacent PRD features.
3. Read the task's required product, architecture, threat, authorization, implementation, ADR and specification documents before editing.
4. Preserve the authenticated server-side action boundary for all business writes. No UI, Agent, MCP, script, generic CRUD route or source credential may bypass it.
5. Treat model output, source documents, API descriptions, connector responses, Skills, MCP metadata and UI declarations as untrusted. They cannot grant identity, permission, approval, verification or publish rights.
6. Authorize reads before content reaches a model. Recheck current authorization for caches, exports, citations and each action transition.
7. Never assume exactly-once external effects. Unknown outcomes require reconciliation. One durable coordinator owns side-effect retry decisions; no blind retry after an ambiguous source response.
8. Do not add a parallel ontology/object/action/permission/query/REST/UI schema engine. ObjectStack is preferred only after the TP-02 gate; if a critical gate fails, stop and write a superseding ADR first.
9. Do not weaken validation, authorization or tests to make a build green. For changes to trusted boundaries, write meaningful failing tests before implementation and retain negative cases.
10. Every new runtime dependency, public contract, identity mapping, state transition or deployment model needs an ADR or a change to an accepted ADR.
11. Do not commit real business/customer data, resumes, local paths, credentials, `.env` files, prompts or hidden chat state. Use synthetic fixtures.
12. Report commands actually run and their results. Static schema or lint checks do not prove runtime authorization. Unrun tests are not passing tests.

## Definition of Ready for each TP

Before implementation, the task owner records all of the following in the TP specification or task story:

- User outcome and named persona.
- Exact in-scope behavior and explicit non-goals.
- Stable acceptance examples covering success, denied access, invalid input, stale/partial data, and failure/recovery where applicable.
- Dependencies completed with evidence; each proposed framework choice is clearly marked as such until qualified.
- Files/modules to create or change, based on the qualified repository structure.
- Public interfaces, data ownership, identity/permission checks and failure semantics.
- Data classification, retention, secret handling and threat-model impact.
- Test layers, exact commands and expected outcome. Security changes require negative tests.
- API/schema compatibility, migration and rollback impact.
- Documentation, ADR, changelog and operational runbook changes.

If any item is unknown, the task is not Ready. Create a bounded research/spike TP or update the existing spec; do not ask the coding model to invent the decision.

## AI task execution protocol

For every TP, the AI implementation team follows this sequence and posts evidence at each checkpoint:

1. **Orient:** inspect `AGENTS.md`, the stable TP, its dependencies, required specs, current Git status and the exact baseline commands. Do not overwrite unrelated user changes.
2. **Check readiness:** list each Definition of Ready item as satisfied with a source reference, or stop with the missing decision/evidence. Do not silently promote a proposed ADR to accepted.
3. **Plan the TP:** list touched paths, contracts, tests and documentation changes. Keep the plan within one TP and ask for clarification only for a real unresolved product decision.
4. **Establish evidence:** run the relevant existing baseline and capture the result. For an unimplemented module, do not claim its future test command passed.
5. **Test first:** add a focused failing test for each new behavior or trusted boundary. Prove it fails for the intended reason before changing implementation.
6. **Implement the smallest vertical slice:** use qualified APIs, types and framework extension points. Do not fabricate adapter behavior or mock away the boundary under test.
7. **Verify:** run focused tests, the relevant full suite, typecheck/lint/build, contract generation, migration checks and security cases required by the TP. Report exact commands and outcomes.
8. **Review:** inspect the diff against acceptance, security invariants, public API compatibility, dependency/secret/data changes and generated files. Fix all known defects before handoff.
9. **Document:** update the TP evidence, progress, changelog, ADRs, API/schema docs and runbooks affected by the result. Mark done only when its Definition of Done has actual evidence.
10. **Handoff:** provide commit/diff reference, acceptance-to-evidence map, commands and actual results, limitations, residual risks, and the next dependency-unblocked TP. Do not start that next TP in the same work item.

## Stop conditions

The coding agent stops implementation and records a blocker when any of these occurs:

- A required dependency is not done or its acceptance evidence is missing.
- ObjectStack or another framework behavior is inferred from a blog, generated type, mock or older version instead of the pinned qualified release.
- A route, client, MCP tool, generic CRUD surface or background worker can bypass authorization/action checks.
- A write has no source-owned operation, canonical effect, current authorization, idempotency/reconciliation behavior, or explicit human decision policy.
- Source truth, identity delegation, revocation, partial-result semantics or a data-retention rule is unknown.
- A requested feature requires arbitrary model-generated code, a second core schema, an unreviewed package, or an unsafe network path.
- A previously passing security test regresses, a security test is flaky in a way that hides a denial, or someone proposes weaker assertions to pass.
- A requirement cannot be met without changing a public contract, security boundary, state model or accepted ADR.

The blocker report must name the failed gate, affected TP/requirement, reproducible evidence, smallest decision needed, and documents/ADRs that would change. Do not start unrelated implementation while blocked; WIP stays one.

## Required AI implementation request

Copy this template into the coding team's task system and replace only the bracketed task identifiers and source references. Do not paste the entire PRD as an unbounded coding prompt.

```text
Repository: wu-xiaochen/trusted-agent-platform
Task: [one stable TP ID and title from docs/backlog.json]
Branch/commit: [current base]

Before editing:
1. Read AGENTS.md and the exact canonical documents listed by this TP.
2. Confirm all dependsOn tasks are done with evidence and this TP satisfies the Definition of Ready in docs/engineering/AI-CODING-HANDOFF.md.
3. Report scope, files, contracts, threat impact and exact verification commands. If a decision is missing, stop and report it; do not invent one.

Implementation rules:
- Work on this TP only; keep WIP at one.
- Use accepted ADRs and qualified framework interfaces only.
- Preserve all AGENTS.md security invariants and stop conditions.
- For trusted behavior, write a failing negative test before implementation.
- Do not create parallel ObjectStack metadata engines or bypass the server action boundary.
- Use synthetic data. Never add secrets, customer data, personal files or local paths.
- Update docs, ADRs, changelog and backlog evidence as required.

Completion report must include:
- Changed files and acceptance criterion -> evidence mapping.
- Exact commands run and actual results; clearly list commands not run.
- Security/data/dependency/API/migration impact and residual risk.
- Commit/diff reference and next dependency-unblocked TP; do not start it.
```

## Current handoff decision

The repository is ready for **TP-02 only**. The AI team must first complete the staged qualification in `docs/specs/TP-02-objectstack-qualification.md`, attach reproducible evidence and accept/reject ADR-0002. TP-03 user validation may proceed only as a separately scoped research activity if it does not depend on unqualified runtime code; feature implementation beginning at TP-04 remains gated. No later TP should be described as “blind-code ready” until it independently satisfies the Definition of Ready.
