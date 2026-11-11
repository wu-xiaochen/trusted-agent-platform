# Qualification Environment Baseline (G0)

Recorded **before** choosing a framework tag, per plan Task 1. Host is a development machine; TP-02 qualifies software behavior, not production sizing.

## Host

| Item | Value |
|---|---|
| OS | macOS 26.2 (build 25C56), Darwin 25.2.0 |
| Architecture | arm64 (Apple M1 Pro) |
| Memory | 16 GB physical; Docker Desktop allocation 10 CPUs / 7.75 GiB |
| Shell | zsh |

## Toolchain (exact observed versions)

| Tool | Version | Notes |
|---|---|---|
| Node.js | v22.22.3 | satisfies ObjectStack `engines: node >=22.0.0` |
| npm | 10.9.8 | |
| pnpm | 10.12.1 | workspace/lockfile tooling |
| git | 2.46.0 | |
| Docker Engine | 28.0.4 (Desktop, Compose v2.34.0) | daemon running; Linux containers |
| psql client | 14.18 (Homebrew) | client only; no local PostgreSQL **server** (no brew service) |
| Python | 3.13.3 | used only for repo baseline contract tooling |

## Services and port plan

An unrelated `zhixin-postgres` (`postgres:15-alpine`) already owns host port **5432**; it is not touched by this spike. The spike uses non-conflicting host ports:

| Service (containerized, pinned) | Host port → container | Purpose |
|---|---|---|
| PostgreSQL for the qualification host | 55432 → 5432 | ObjectStack SQL runtime + disposable data |
| External OIDC test issuer (Dex) | 5556 → 5556 | real external IdP; dev login is not production evidence |
| Temporal dev server | 7233 → 7233; UI 8099 → 8080 | durable coordination gate (G13/G14) |
| Qualification host process (node, host network) | 3100 | synthetic ObjectStack app HTTP endpoint |

All spike data is disposable and lives in git-ignored local container volumes / `work/`. No real customer data or credentials are used; IdP users and secrets are synthetic and recorded only as env-var **names** in docs, never values.

## Baseline verification before spike work

Commands run from repository root on 2026-11-03:

```sh
python3 -m unittest discover -s tests -v
# Ran 16 tests in 0.007s — OK (all 16 static contract tests)
python3 -m scripts.check_contracts
# PASS: task.json — static declaration only; no runtime authorization or readiness asserted.
```

This establishes the existing foundation (static declaration validator only). It is not evidence of any runtime authorization.
