# Upstream Pin (G1)

Selected **only from official upstream metadata** (GitHub repo/releases/tags and the npm registry), per plan Task 1 gate: no install/code against an unpinned or license-unclear candidate.

## Immutable pin

| Attribute | Value | Source |
|---|---|---|
| Repository | https://github.com/objectstack-ai/objectstack | canonical upstream |
| Repo-level license | Apache-2.0 (`spdx_id: Apache-2.0` on repo metadata) | GitHub license API |
| Release train | **18.2.0**, published 2026-10-27 (non-prerelease) | GitHub Releases |
| Pinned commit | **`27f38ada498162835c2f1d56e6edabe18910b4ed`** | peeled object (`^{}`) of every `*@18.2.0` annotated release tag via `git ls-remote --tags` |
| Tag used to fetch | `@objectstack/cli@18.2.0` (annotated tag → commit above; all 18.2.0 package tags peel to the same commit — monorepo-wide release commit) | `git ls-remote --tags` |
| Default branch HEAD at selection time | `1c1a5d4021e803c98850a79cf17bf57ab496d08d` (2026-11-03) — **not** used; release commit is used | `git ls-remote HEAD` |
| Node requirement | `engines.node >=22.0.0` (observed on published `@objectstack/*` packages) | npm registry metadata |

Fetch command (shallow, tag-pinned, no floating branch):

```sh
git clone --depth 1 --branch @objectstack/cli@18.2.0 \
  https://github.com/objectstack-ai/objectstack.git
# HEAD verifies 27f38ada498162835c2f1d56e6edabe18910b4ed
```

## Published packages observed at 18.2.0 (npm registry, Apache-2.0 for framework packages)

Direct registry metadata confirmed (latest = 18.2.0, license Apache-2.0, `directory`-linked back to the monorepo):

- `@objectstack/spec` — ObjectStack protocol & specification: TypeScript interfaces, JSON Schemas, conventions
- `@objectstack/types` — shared runtime-environment interfaces
- `@objectstack/runtime` — core runtime & query engine (ObjectQL)
- `@objectstack/core` — microkernel core

GitHub releases at 18.2.0 additionally include (among others) `@objectstack/setup`, `@objectstack/studio`, `@objectstack/skills`, `@objectstack/trigger-api`, `@objectstack/trigger-record-change`, `@objectstack/trigger-schedule`, `@objectstack/verify`, and `create-objectstack`; UI is published under `@object-ui/*` (repo policy: MIT, vs Apache-2.0 outside `ui/`). Exact installed set and per-package/transitive licenses are inventoried after clean bootstrap in [package-license-matrix.md](./package-license-matrix.md) — repo-level license is not treated as sufficient per SOURCES.md governance.

## Upstream governance snapshot (non-quality evidence)

- Created 2026-01-18; very active through qualification date (latest push 2026-11-03); 81 stars / 22 forks / 286 open issues at selection — small community, consistent with ADR-0002's stated risk. Activity numbers are context, not qualification evidence.
- A `pre-cloud-split` tag exists, indicating cloud/control-plane code separation; the spike must use only the self-hosted open runtime (no ObjectOS-only features), per ADR-0002.

## Re-verification

npm tarballs carry integrity hashes; the spike lockfile (pnpm) records resolved versions and integrity for everything actually installed, so the pin is independently reproducible from the committed lockfile plus this commit SHA.
