# TP-02 Runtime Qualification Implementation Plan

> **For agentic workers:** Execute this plan only as the single active product task TP-02. Use the repository development contract and `docs/engineering/AI-CODING-HANDOFF.md`. Do not start TP-04 or runtime implementation from this plan.

**Goal:** Decide with reproducible evidence whether a pinned ObjectStack release can serve as the platform's single business metadata and authorization runtime, and record an accepted or superseding architecture decision.

**Architecture:** This is a disposable, synthetic qualification spike. It tests framework-provided routes, metadata, permissions, connector boundaries, UI rendering and durable action coordination. A failure at an authorization or schema-duplication gate rejects the candidate; the spike must not grow into a parallel production kernel.

**Tech Stack:** Candidate versions and exact package set are selected and recorded during the spike from official upstream release and package sources. Do not preselect versions from this plan. Use the candidate's supported Node/pnpm versions, PostgreSQL and Docker/Compose as needed; the spike output must pin every version actually tested.

## Global Constraints

- Follow the repository `AGENTS.md` development contract and keep WIP at one.
- Use synthetic records only; no customer data, production credentials or real source writes.
- ObjectStack is a candidate, not an accepted dependency, until the pass/fail gates below are evidenced and ADR-0002 is updated.
- ObjectStack-native object/action/permission/view metadata is the only candidate source of truth; no project-owned competing schema is allowed.
- Test real route/plugin boundaries, not only unit mocks or UI hiding.
- Unknown external write outcome must reconcile or reach manual review; never assert exactly-once remote effects.
- Record exact commands and actual outputs. Do not report unrun checks as passing.
- Do not add product features outside the synthetic qualification slice.

## Files and evidence responsibilities

- Modify `docs/specs/TP-02-objectstack-qualification.md` only if the procedure or gates need a documented clarification.
- Create `docs/research/OBJECTSTACK-QUALIFICATION.md` as the evidence ledger, including environment, exact source/package pins, licenses, commands, results, screenshots/log references with no secrets, bypass matrix, and unresolved risks.
- Create a disposable qualification app under `spikes/objectstack-qualification/` only after recording the upstream candidate and pin. It must be isolated from production package workspaces and excluded from deployment/release artifacts.
- Update `docs/adr/0002-runtime-and-frameworks.md`, affected ADRs, `docs/backlog.json`, `docs/progress.md`, `docs/roadmap.md`, and `CHANGELOG.md` based on observed outcomes.
- Add tests only for executable spike behavior and preserve failing security cases. Do not add placeholder production packages.

## Task 1: Freeze the qualification protocol

- [ ] Read `AGENTS.md`, `docs/product.md`, `docs/architecture.md`, `docs/architecture/THREAT-MODEL.md`, `docs/architecture/AUTHORIZATION-MATRIX.md`, `docs/engineering/IMPLEMENTATION-GUIDE.md`, `docs/adr/README.md`, `docs/adr/0002-runtime-and-frameworks.md`, `docs/specs/TP-02-objectstack-qualification.md`, and `docs/architecture/DOMAIN-PACKAGE.md`.
- [ ] Confirm the TP-02 dependencies and current working-tree state; preserve unrelated changes.
- [ ] Create the qualification evidence ledger with an environment table and a result row for every gate: `unrun`, `pass`, `fail`, or `blocked`.
- [ ] Record OS/architecture, Node, package manager, container engine, PostgreSQL and test IdP versions before choosing a framework tag.
- [ ] Select the candidate only from official upstream source/release/package metadata. Record immutable tag/commit, package versions, license identifiers and source URLs.

**Gate:** Do not install or code against an unpinned or license-unclear candidate.

## Task 2: Prove clean bootstrap and operations shape

- [ ] From a clean checkout, use only upstream-supported install/bootstrap instructions for the pinned candidate.
- [ ] Record exact commands, environment variables by name (never values), startup steps, health endpoints, ports, logs and every undocumented/manual step.
- [ ] Start a minimal host against PostgreSQL and create a synthetic work-order record.
- [ ] Exercise schema migration, restart, backup and restore instructions on disposable data; record failures and recovery behavior.
- [ ] Capture dependency, license and upstream support findings for every package included in the host.

**Gate:** If the host requires a closed control plane, unclear license, unsupported patching, undocumented migration path or unsafe default credential, mark fail and stop dependent tests.

## Task 3: Prove identity and permission enforcement across paths

- [ ] Configure an external OIDC test issuer; do not treat a development login as production identity evidence.
- [ ] Create two synthetic users with disjoint object, field and record grants.
- [ ] Exercise allowed and denied reads through every enabled REST route, client API, plugin/service API, MCP tool and generic ObjectQL/CRUD path.
- [ ] Attempt direct create/update/delete on the source-owned work-order record through every exposed path; require unavailable routes or a server-enforced named action boundary.
- [ ] Change a grant or revoke a session and verify current access is denied on the next protected request, including any cache path used by the spike.
- [ ] Record route/tool names, actor identity, expected result, actual status/result and sanitized evidence for each case.

**Gate:** Any bypass, default allow, caller-supplied identity acceptance, or generic write path without the named action boundary is a candidate failure. Do not patch around it inside the spike.

## Task 4: Prove connector and model-context boundaries

- [ ] Configure a synthetic read-only source using the narrowest available identity mode; record whether access is delegated or an installation service identity.
- [ ] Expose one bounded read capability with typed arguments, pagination, time/row/byte limits, source provenance and explicit partial/stale outcomes.
- [ ] Verify authorization and field filtering occur before any model/provider call; use a fake or local test provider that records only synthetic fields.
- [ ] Change source schema and verify the capability becomes visibly stale or blocked instead of silently changing meaning.
- [ ] Attempt an unauthorized record and field request; prove no protected value appears in provider input, logs, MCP output or cache responses.

**Gate:** If the platform cannot prove pre-context filtering, least privilege, bounded results and current authorization, stop and record failure.

## Task 5: Prove native metadata extension and controlled view

- [ ] Define one native work-order object, relation, read/query, named action, permission and native view using only supported ObjectStack contracts.
- [ ] Attach one task-evidence/readiness extension by stable native IDs; do not duplicate native object/action/permission/view structure.
- [ ] Render a conventional task screen using qualified native view metadata and registered components.
- [ ] If app-level layout composition is missing, test only a minimal manifest referencing native IDs; document its exact missing capability and validation boundary.
- [ ] Reject arbitrary script, unknown component, ungranted field, unbound action, cross-release reference and model-supplied effect/approval.
- [ ] Attempt to implement a required view or metadata capability in a parallel project schema; if unavoidable, fail the candidate pending an ADR selecting one replacement core.

**Gate:** Native validators must own native metadata. Platform validation may cover only the narrow extension and cross-boundary invariants.

## Task 6: Qualify durable action coordination without a real write

- [ ] Implement a synthetic action adapter whose “source commit” is a local deterministic fake with a queryable operation key.
- [ ] Demonstrate local ledger/outbox atomicity before scheduling the durable coordinator.
- [ ] Exercise duplicate delivery, worker restart, timeout before source commit, source commit followed by lost response, and reconciliation query failure.
- [ ] Confirm one coordinator owns retry decisions and ambiguous outcomes become `unknown/reconciling/manual-review`; no second path retries blindly.
- [ ] Inspect durable history and logs with canary values to verify secrets and sensitive business arguments are not persisted.

**Gate:** If the system cannot distinguish a known failure from an unknown remote outcome, do not enable writes or claim safe retry.

## Task 7: Qualify protocol and deployment boundaries

- [ ] Verify MCP authentication maps the authenticated principal into the same kernel and each tool is authorized per call; probe untrusted server metadata and scope escalation.
- [ ] Test AG-UI, if selected, only as a transport for interaction events; prove it grants no capability or approval and does not become the canonical app schema.
- [ ] Record whether Skills are static reviewed instructions or executable extensions; no automatic installation, shell access or business-mode arbitrary execution is permitted.
- [ ] Measure local process count, memory/CPU footprint, startup, health and upgrade/recovery cost on the recorded environment.
- [ ] Record which behaviors are framework-provided, which use documented plugin APIs, and which would require private APIs or a fork.

**Gate:** A private API dependency, trust-boundary bypass, or unbounded operational burden is a fail or requires a documented, accepted alternative decision before product dependence.

## Task 8: Decide and hand off

- [ ] Complete the evidence ledger; every gate must be `pass`, `fail`, or `blocked` with evidence—no unresolved `unrun` gate may be hidden by an overall pass.
- [ ] Update ADR-0002 with candidate, exact versions/licenses, tested routes, evidence, limitations and reconsideration trigger.
- [ ] If a critical gate fails, write a superseding ADR that selects one replacement runtime; do not keep a competing ObjectStack and custom core.
- [ ] Update backlog TP-02 status only from actual evidence and identify which downstream TPs are now unblocked.
- [ ] Update project progress and changelog; include exact commands/results and known limits.
- [ ] Review the diff for credentials, local paths, private data, unsupported claims and accidental product code outside the spike.
- [ ] Hand off the evidence ledger and a recommendation; do not start TP-03/TP-04 in the same WIP item.

## Acceptance evidence and outcome values

TP-02 passes only when every critical identity, authorization, generic-write containment, native metadata, package-license, migration and unknown-outcome gate has reproducible evidence. The result is one of:

- `qualified`: all critical gates pass; ADR-0002 becomes Accepted with exact pins and bounded known limitations.
- `rejected`: at least one critical gate fails; a superseding ADR selects one replacement core before downstream runtime work.
- `blocked`: an external prerequisite prevents a decision; record owner, evidence needed and a date to re-evaluate. Do not mark downstream implementation ready.

No result authorizes broad production access. Product release gates remain governed by the relevant TP acceptance and security evidence.
