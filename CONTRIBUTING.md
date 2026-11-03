# Contributing

Thanks for helping make safe enterprise Agent work easier to understand and operate. The project is currently a product/engineering design baseline; the first implementation task is TP-02, not a broad feature build.

## Before proposing a change

1. Read [AGENTS.md](AGENTS.md), [product requirements](docs/product/PRD.md), [architecture overview](docs/architecture.md), relevant ADRs, and the linked story.
2. Open or select a stable TP item in [backlog.json](docs/backlog.json). Keep one product task in progress.
3. For a new dependency, public contract, source identity mapping, state model, or trust boundary, write or update an ADR before implementation.
4. Use synthetic data. Never attach customer data, credentials, resumes, logs with personal data, or private research to public issues/PRs.

## Pull request expectations

- One behavioral outcome per PR. Link TP/PR IDs and explain user-visible behavior.
- State exact files and package boundaries changed; document failure and denied behavior.
- Include tests appropriate to risk, OpenAPI/schema/migration changes, docs and changelog.
- Report actual commands and outcomes. List checks not run and why. Do not claim runtime safety from static schema validation.
- For authentication, authorization, data access, MCP, Skills, UI rendering or actions, describe the trust boundary and how forbidden paths were tested.
- Include license and dependency review for new packages. Do not copy source from reference projects into this repository without checking license and attribution.
- Keep PRs focused and reviewable; do not submit a full AI-generated rewrite without a requirement-linked diff and independent review.

## Coding workflow

The expected workflow is in [BMAD-informed project process](docs/bmad/README.md), [implementation guide](docs/engineering/IMPLEMENTATION-GUIDE.md), and [quality/release rules](docs/engineering/QUALITY-AND-RELEASE.md). The first framework decision is gated by [TP-02](docs/specs/TP-02-objectstack-qualification.md).

## Discussion and scope

Feature proposals should explain the user/task, source capability, identity model, data sensitivity, failure/recovery state, and why an existing extension or protocol is insufficient. The team may defer a good idea if it increases the first vertical slice without evidence.

