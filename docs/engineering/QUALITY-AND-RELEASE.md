# Quality, Verification, and Release Rules

**Version:** 0.1.0 · **Status:** Design baseline · **Updated:** 2026-11-03

## Quality gates by change type

Each implementation issue defines the behavior, acceptance evidence, security/data impact, and user-visible failure states before code is written. Verification is proportional to risk:

| Change | Minimum evidence expected in the implementation PR |
|---|---|
| Pure package validator/domain rule | Unit tests for valid and rejected examples; property/boundary cases for parsing and limits |
| API contract | Request/response contract test, authn/authz negative test, generated OpenAPI/client diff |
| Connector | Reusable connector contract suite, authorization/scope tests, timeout/pagination/limit tests, sanitized failure behavior |
| UI flow | Component/accessibility test for states, one browser journey for critical paths, evidence that no unauthorized binding renders |
| Auth/action/approval | Negative authorization cases, changed-effect/replay/revocation tests, concurrency/idempotency checks, audit assertions |
| Durable workflow | Restart/replay, timeout after source commit, duplicate delivery, unknown outcome, reconciliation and manual-review tests |
| Schema/migration | Migration-up test on supported PostgreSQL, compatibility check, index/locking note, restore/rollback plan |
| Extension/MCP/Skill | Hostile metadata/content test, allowlist/authz test, egress/timeout boundary and schema validation |
| Release/deployment | Clean installation, upgrade from prior release, backup/restore, secret rotation and health check |

These are design requirements for future implementation PRs. They are not evidence that current runtime code has passed them.

## Product-level acceptance and implementation handoff

Every implementation change must deliver a user-visible or maintainability outcome tied to a stable TP/PR ID. A code-only patch is incomplete when its API/schema, permission contract, runbook, failure states, or source capability report is part of the user outcome. Before marking a TP done, record:

1. The changed executable artifact (code, migration, connector, app release, or deployment profile) and exact version/digest where applicable.
2. Success, unauthorized, malformed, partial, stale/conflicting, and recovery test evidence relevant to that task.
3. Exact commands run and actual pass/fail output; identify static checks separately from runtime authorization or deployment verification.
4. Security/data review: identity used, data exposed, source authority, secret handling, side effects/retry ownership, and residual risks.
5. Updated public API/schema/ADR/migration documents, user documentation, changelog, backlog state and progress evidence.
6. Known limitations and disabled capabilities; do not label a mocked provider or synthetic connector as real integration support.

The product outcome is not considered achieved because an Agent generated code or a page. For the first release, evidence must show a supported source profile, an authorized cross-source read, owner-reviewed task model, validated cases, a role-tested AppSpec, and operational self-hosted deployment. A write-capable release additionally needs the action/reconciliation/security gates in M4 and a named source-specific safety review. Do not enable guarded autonomy just because the model completed a happy-path demo.

When AI coding is used, one TP is the maximum product WIP. The selected story defines the exact files/contracts likely to change and a narrow outcome. The coding agent may not silently choose among proposed ADR alternatives, bypass prerequisite gates, broaden a connector claim, alter a role/action state model, or close future backlog work. If it finds an unstated decision, it reports the gap and stops the dependent code path while preserving independent progress.

## Planned tooling

- **Unit/integration:** Vitest for TypeScript unit tests; PostgreSQL integration tests with Testcontainers or the same versioned Compose image used in CI.
- **Web:** Testing Library + axe checks for component behavior; Playwright for critical end-to-end journeys.
- **Contracts:** JSON Schema 2020-12 validation and OpenAPI compatibility diff.
- **Static quality:** TypeScript compiler, ESLint, Prettier check, dependency boundary check, secret scan, dependency/license audit.
- **Security:** SAST and dependency scanning in CI; DAST only against ephemeral test deployment; manual threat-model review for write-capable release.
- **Resilience:** deterministic fake connectors and Temporal test environment for crashes, replay, latency, rejection and ambiguous external outcome.

Pin tool versions in lockfile. Do not add a test framework until TP-02 verifies the runtime. Avoid tests that simply restate an implementation detail; prioritize public contract, denied path, concurrency, user-visible state, and recovery.

## CI requirements

Pull requests run formatting, lint, typecheck, unit and relevant integration/contract tests, API/client generation drift, migration validation, dependency/security checks, and build. Required checks are branch-protection settings in GitHub and must be configured separately; a workflow file alone is not enforcement. Pin third-party GitHub Actions to full commit SHA and grant minimum token permissions. Do not use `pull_request_target` with untrusted code.

## Versioning

- Product follows SemVer after first stable release. Before v1.0, breaking changes can occur but still require migration notes and changelog entries.
- API paths and package schemas version independently.
- Published business package uses SemVer plus immutable content digest; release records exact dependency references.
- Database migration version is monotonic and never rewritten after release.
- Harness/provider/model versions are runtime metadata, not part of source package identity unless their output changes business semantics.
- Every release publishes a changelog, SBOM, checksums, supported configuration matrix, upgrade/rollback note, and known limitations.

## Branches and change history

- Protect `main`: no force-push, require successful CI, and use a pull request for product changes. Require an independent reviewer for security/authz/action/connector/migration changes; where the team is too small to provide one, do not enable the affected capability in a public release until independent review exists.
- Branch names: `feat/TP-XX-short-name`, `fix/TP-XX-short-name`, `docs/TP-XX-short-name`, or `security/TP-XX-short-name`.
- Commit messages use Conventional Commits with stable task ID where applicable: `feat(actions): TP-11 bind confirmation to effect digest`.
- Use Changesets for published workspace packages after the ObjectStack package layout is established. Commit the generated changeset with the feature; do not bump unrelated packages.
- Release tags are annotated `vX.Y.Z`; release commit and artifact digests are recorded. Use signed tags when maintainer key infrastructure is available.
- Never rewrite a released migration, package digest, API version, or changelog entry. Fix forward with a new version and migration note.

## Operational support matrix

First supported deployment is single-organization Docker Compose on supported Linux/amd64 and arm64. Supported PostgreSQL and Node patch lines are pinned in each release. External OIDC, SMTP, object storage, and model endpoints have tested compatibility matrices only after the corresponding integration is exercised. Avoid promising cloud/Kubernetes compatibility before repeatable deployment tests.

## Release checklist

1. Requirement and acceptance IDs are met; unsupported behavior is documented.
2. Security, data access, action state, extension and upgrade changes have named reviewer/evidence.
3. CI checks pass on the release commit; no unresolved critical/high security finding without explicit maintainer disposition.
4. Demo and migration/backup/recovery docs match the release.
5. Changelog, SBOM, artifact checksums and license notices are complete.
6. Release tag points to reviewed commit; image/package provenance is recorded.
7. Post-release install and issue intake are monitored; a rollback or disable plan exists.

