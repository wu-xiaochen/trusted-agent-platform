# Product-to-Code Workflow (BMAD-Informed)

**Purpose:** Keep AI-assisted development focused on tested product outcomes and accepted architecture decisions. This repository uses lightweight, inspectable artifacts inspired by structured product and architecture planning. The BMAD framework itself is not a runtime dependency or a requirement for contributors.

## Working sequence

1. **Understand:** Update `PRODUCT-STRATEGY.md`, `PRD.md`, `BUSINESS-ARCHITECTURE.md`, and `UX-SPEC.md` with user outcome and evidence. Separate confirmed facts, assumptions, and open decisions.
2. **Architect:** Update system/data/API/security docs and create or amend an ADR for a new dependency, public contract, source identity mapping, state model, or trust boundary.
3. **Slice:** Select one TP ID from `docs/backlog.json`. Write a narrow story/spec under `docs/specs/` with actor, trigger, preconditions, flow, outcomes, denied paths, failure/recovery states, and acceptance evidence.
4. **Plan:** Break the story into small changes that can be reviewed independently. Identify the API/schema/migration/docs/test changes before implementation. Keep product WIP at one.
5. **Implement:** Have AI coding tools work from the linked story, `AGENTS.md`, ADRs, schema contracts, and defined package boundaries. Reject invented requirements and unreviewed dependencies.
6. **Verify:** Run only the applicable verification commands; record actual output in the PR. Add adversarial tests when changing auth, actions, data scopes, MCP, generated UI, or durable state.
7. **Review:** Review behavior from acceptance criteria, inspect permissions/effect boundaries, generated diffs, migrations, dependency licenses, and operational impact.
8. **Ship and learn:** Update changelog, release notes, progress, unresolved assumptions and next backlog priority. Revisit strategy only with observed user or operational evidence.

## AI coding prompt contract

Every implementation task should include:

- Stable TP and PR IDs, actor and user problem.
- Exact in-scope behavior and explicit out-of-scope behavior.
- Relevant accepted/proposed ADRs and package/API/schema version.
- Acceptance criteria with expected success, denied, partial, stale, conflict and recovery behavior as applicable.
- Data classifications, authz owner, source authority, and side-effect/retry semantics.
- Files/modules permitted to change and dependency boundaries.
- Commands to run and evidence to report, including what has not been tested.

Ask the coding agent to inspect relevant source and report assumptions before broad edits. For security-sensitive work, have a separate reviewer examine the trust boundary and failure path. Never let the same generated patch both redefine the requirement and declare itself compliant.

The repository is designed for AI-assisted implementation, not blind acceptance of a single prompt across the whole platform. An autonomous coding run may implement only the currently selected TP item and its linked ready spec. It must stop before work that depends on a proposed/unqualified ADR, missing source contract, unclear authority, or unapproved policy choice. It must not mark backlog items done or claim tests pass without the recorded evidence. A finished implementation handoff includes the code/artifact, changed contracts/migrations as applicable, meaningful success and denied/failure tests, exact commands/results, security review notes, docs/changelog/progress update, and known gaps. Human review remains mandatory for identity, permissions, data scopes, action state, dependencies, migrations, and releases.

## Planning artifacts

| Artifact | Canonical location |
|---|---|
| Product strategy | `docs/product/PRODUCT-STRATEGY.md` |
| Product requirements | `docs/product/PRD.md` |
| UX and generated app behavior | `docs/product/UX-SPEC.md` |
| Business architecture | `docs/architecture/BUSINESS-ARCHITECTURE.md` |
| System/data/API/security design | `docs/architecture/` |
| Technical decision records | `docs/adr/` |
| Stable work items | `docs/backlog.json` |
| Detailed implementation story | `docs/specs/TP-XX-*.md` |
| Delivery sequence | `docs/roadmap.md` |
| Current completion/evidence | `docs/progress.md` and linked PR/release |

## BMAD reference

BMAD may be used as an optional planning/review aid, but its generated files are not authoritative unless promoted into the canonical documents above. Pin a BMAD version if adopting its automation; review its license, generated instructions, file changes, and upgrades as third-party tooling. Do not ask every contributor to install a large prompt/workflow framework merely to read or implement a story.

