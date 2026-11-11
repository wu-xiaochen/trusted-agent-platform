# G1/G2/G3 — package inventory, clean bootstrap, migration and operations evidence

All commands were run on the environment in [environment.md](environment.md).
Raw logs live in `local/` (git-ignored); this file records the reproducible
commands and measured outcomes.

## 1. Candidate and pin

- Candidate: official scaffolder `create-objectstack@18.2.0` (blank template),
  run with pnpm 10.31.0 (the version pinned in the upstream `packageManager`).
- Upstream release commit: `27f38ada498162835c2f1d56e6edabe18910b4ed`
  (see [pin.md](pin.md)).
- Install result: `Done in 4m 14.1s using pnpm v10.31.0`; lockfile
  `maint-qual/pnpm-lock.yaml` committed by the spike app.

## 2. Default plugin composition of `os start`

A minimal `defineStack` app booted with `os start` composes (from the boot log,
`local/host.boot1.log`): Auth, Security, Audit, MCP server, RestAPI,
Dispatcher, Automation + record-change/schedule/time-relative/API triggers,
Queue/Job/Cache/Settings/Email/Storage/SMS/Sharing/Messaging/Analytics/Package
services, ExternalDatasourceService + DatasourceAdmin routes, ConsoleUI, and
the three declared connector plugins (rest/openapi/mcp). The CLI assembles the
production kernel itself — no manual plugin wiring was needed to reach the full
trust surface.

## 3. PostgreSQL boot (managed platform datasource)

- First boot: `OS_DATABASE_URL=postgres://…@localhost:55432/objectstack`,
  `NODE_ENV=production`, `os start` against a compiled artifact
  (`OS_ARTIFACT_PATH`). Boot-time schema sync created **76 managed tables**
  (`os migrate plan` later reported "Examined 76 managed table(s)").
- Two non-fatal `DATABASE_ERROR (2BP01)` lines appeared on every boot
  (`cannot drop index … because constraint … requires it`, values redacted by
  the driver). The sync completes, `/api/v1/health` answers 200 and
  `/api/v1/ready` answers `state: running`. Logged upstream as an idempotent
  index-reconciliation issue; it does not block migrations. **Residual
  operational item for product adoption.**
- Health split works as documented: liveness ignores dependencies; readiness
  pings data drivers.

```json
GET /api/v1/health → {"data":{"status":"ok","version":"18.2.0",…}}
GET /api/v1/ready  → {"data":{"status":"ready","state":"running"}}
```

## 4. Production defaults measured

- `admin@objectos.ai / admin123` dev seed: sign-in answers
  `401 INVALID_EMAIL_OR_PASSWORD` on a `NODE_ENV=production` host (the seed is
  gated by `devLogins`/development only).
- Bootstrap owner: first sign-up succeeds and is promoted to platform admin;
  second sign-up answers `403 SELF_REGISTRATION_CLOSED` (default audience
  posture is `invite_only`).
- Session cookie on password sign-in:
  `Set-Cookie: better-auth.session_token=…; Max-Age=604800; Path=/; HttpOnly; SameSite=Lax`
  (no `Secure` on plain-HTTP localhost; behind HTTPS the deployment guide
  requires `OS_AUTH_URL`/`OS_TRUSTED_ORIGINS`).
- Credentialed POSTs require an `Origin` header (`403 MISSING_OR_NULL_ORIGIN`
  without one) — CSRF protection is enforced server-side.
- Booting with `OS_AUTH_SECRET` unset did **not** open anonymous access:
  anonymous reads still answered 401. On a durable host `os start` mints and
  persists a secret under `.objectstack/auth-secret`; the documented
  "unauthenticated server" failure mode applies to stateless containers and
  hand-built kernels. Stateless containers still require explicit secrets
  (`OS_SECRET_KEY` required for clustered/container boots).
- Storage defaults to a local-driver uploads dir with a boot warning to use an
  object store in production.

## 5. Restart and migration lifecycle

- Host restart (multiple times across the spike): all users, positions,
  permission assignments, runtime datasource/secret and the federated object
  definition persisted in PostgreSQL; tokens remained valid.
- `os migrate plan` connects read-only, composes the same host stack "for
  declarations only" and reports the managed/federated coverage split
  explicitly:
  - "76 of 77 declared object(s) are in the diffed set; 1 federated (no
    managed table) … an empty result over those objects is UNMEASURED".
  - `os migrate apply` reconciles safe (loosening) changes; destructive DDL
    requires `--allow-destructive`; `OS_MIGRATE_AND_EXIT=1` provides a
    migrate-and-exit job.
- The external datasource does not appear in the platform diff at all (the
  runtime never owns its schema).

## 6. Backup/restore drill (G3)

Reproducible via `scripts/restore-drill.sh`:

1. `pg_dump --format=custom` of the platform DB;
2. restore into a scratch database `objectstack_restore_drill`;
3. boot a second host instance (port 3101) with the same `OS_SECRET_KEY`/
   `OS_AUTH_SECRET` and the same artifact.

Measured: 5 work orders present; the encrypted `inventory_src` datasource
credential decrypted (`hasSecret=true`); federated read through the restored
host returned all 3 spare parts. A third instance booted with a **wrong**
`OS_SECRET_KEY` could not resolve the credential: the external object answered
`503 ERR_DATASOURCE_UNAVAILABLE` (never fell back to a cleartext credential),
matching the documented "key + database are one backup unit" requirement.

## 7. Footprint (measured, idle host)

- Node host RSS ≈ **218 MB**, one process, only outbound connections to the
  two Postgres containers plus the public HTTP port (3100).
- Containers: platform Postgres ≈ 61 MB, source Postgres ≈ 29 MB, Dex ≈ 12 MB.
- Cold boot to `/health` 200 ≈ 5–7 s on this machine (single worker, console
  included). The compiled artifact is 2.5–21 KB (metadata only; runtime lives
  in node_modules).
- Runtime dependency tree: 506 packages installed (see
  [package-license-summary.json](../package-license-summary.json)).
