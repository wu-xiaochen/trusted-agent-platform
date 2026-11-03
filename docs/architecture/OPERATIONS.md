# Operations and Self-Hosted Deployment

**Version:** 0.1.0 · **Status:** Design baseline; support matrix must be proved by TP-14 · **Updated:** 2026-11-03

## Deployment support goal

First target: one organization on one self-hosted Docker Compose installation. Avoid Kubernetes and shared SaaS in v1. The installer needs the customer's domain/network, OIDC identity provider, approved model endpoint, PostgreSQL volume, secret provider and source access. The synthetic demo has no external enterprise dependency.

## Services and dependency ownership

| Process | Starts after | Egress | Persistent state |
|---|---|---|---|
| Web/reverse proxy | API/web assets available | Browser/API only | None |
| ObjectStack platform API | PostgreSQL migration and configuration | IdP, approved sources, provider via gateway if required | PostgreSQL config/audit/action ledger |
| Agent worker | API and model endpoint ready | Platform API + allowlisted model endpoint | Minimal run state via API/agent store |
| Temporal service | Its own persistence and encryption configured | Internal workers only | Workflow history in designated DB/namespace |
| Action worker | Temporal and platform API ready | Platform API + specific approved source endpoints | Activity state in Temporal; authoritative action state in platform DB |
| PostgreSQL | Volume and backup configured | Internal service network only | Platform metadata and business ledger |

Do not use one shared administrator credential for all services. Use separate database roles where possible; Temporal must not read customer domain tables directly. Database and Temporal payload persistence must be encrypted and covered by retention/backup policies.

## Configuration profiles

- **Demo:** synthetic fixtures, development identity only, no outbound source write path, marked as non-production in UI.
- **Self-hosted read-only:** customer OIDC, scoped source read credentials, explicit provider endpoint or no model provider, verified TLS and backup.
- **Controlled write:** read-only baseline plus approved source action, secret manager, service/delegated identity, Temporal TLS/retention, signed effect and reconciliation contracts, security review evidence.

Profile changes cannot silently broaden grants. Production startup fails if development auth, default secret, wildcard CORS, insecure cookie, public database, missing TLS policy, or unsafe workflow settings are detected.

## Operations endpoints and signals

- `/health/live`: process event loop and essential local liveness only.
- `/health/ready`: required database/migration/identity/Temporal state and whether read-only or write capabilities are enabled. No secret or network topology details.
- Metrics: request latency/error by bounded route and result code; connector latency/error/timeout and freshness; run duration/model usage; action state counts/age; outbox delay; reconciliation/manual-review queue; audit write failure; migration and backup age.
- Traces link API request → run → capability query → connector → action intent → Temporal workflow/activity → source correlation. Redact content before exporting telemetry.
- Alert on unresolved unknown outcomes, growing outbox/reconciliation queue, stale/failed source grants, repeated authz denial spikes, audit-storage failure and backup age.

Targets are customer-configured during deployment sizing; do not publish SLO numbers until a supported workload has been measured. High-impact actions fail closed if the audit record cannot be durably written.

## Backup, restore and upgrades

1. Back up PostgreSQL and Temporal persistence consistently; encrypt backups and test retention/deletion policy.
2. Restore into an isolated environment, replay outbox idempotently, query each in-flight action's source correlation, and reconcile before enabling writes.
3. Version the application, package metadata, DB migrations, Temporal workflow code and connector contracts together. Temporal workflow changes follow deterministic versioning guidance; keep old worker compatibility through in-flight histories or drain safely.
4. Upgrade requires backup, migration diff review, compatibility check, and a documented recovery path. Do not promise automatic downgrade after destructive schema migration.
5. Key rotation covers OIDC secrets, source/model provider credentials, DB credentials, encryption keys, signing key and TLS certificates; record expiry and test rollover.

## Incident procedures

- **Suspected credential leak:** disable the connection/grant, rotate at the source, invalidate affected sessions and queued work, assess any action with unknown result, record audit evidence.
- **Agent/model exfiltration concern:** disable provider or affected capability; revoke egress; inspect audit without re-opening sensitive payloads; notify customer operator.
- **Connector compromise:** disable adapter and its source grants, block egress, suspend dependent capabilities; do not auto-retry in-flight writes.
- **Unknown source outcome:** preserve operation key and effect digest, reconcile against authoritative source, record evidence and human decision; never create a second operation solely because of timeout.
- **Audit/DB compromise:** stop writes, preserve forensic copy under customer control, rotate keys, review external audit export and source operation logs.

## Sizing and scaling

Do not prescribe a single CPU/RAM number before connector and model concurrency are measured. Measure API concurrency, per-source limits, Temporal queue lag, model latency/cost, object mapping size and retention. Scale API/web horizontally after session storage is shared and proven; scale each worker pool independently under per-source concurrency limits. Keep one installation's DB capacity and backup restore time in its operational review.

