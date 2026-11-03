# Security Design and Threat Model

**Version:** 0.1.0 · **Status:** Initial review required before write-capable release · **Updated:** 2026-11-03

This document is an engineering design baseline, not a security certification or a claim that the current static validator enforces these controls.

## Assets

Enterprise identity and source credentials; business records and documents; published business rules; approvals and business actions; connector network access; model prompts and outputs; application releases; audit evidence; platform encryption keys and backups.

## Threat actors and trust boundaries

Assume malicious or compromised browser clients, users with excessive access, prompt-injected documents, malicious/misconfigured MCP servers, compromised model provider, poisoned connector metadata, supply-chain dependencies, network attackers, and source systems with partial outage or stale schema. Boundaries include browser/API, API/agent worker, Temporal/action worker, connector/source, MCP server/client, provider/egress, and platform/secret manager.

## Main threats and required controls

| Threat | Control | Evidence required before release |
|---|---|---|
| Model or prompt injection asks for unauthorized tool/data | Model receives only already-authorized facts; tool calls are typed proposals; server checks grant/policy again; no secret or privileged identity in prompt | Adversarial tests with malicious source content and out-of-scope tool requests |
| User forges role, tenant, approver, or confirmation field | Identity and decisions are server-derived, authenticated, bound to effect digest, policy version and expiry; CSRF protection on cookies | API negative tests for every protected route and stale/revoked context |
| Approval applies to changed parameters | Canonical normalization and digest; any target/argument/release/policy change invalidates confirmation and approval | Tamper/replay tests including order, omitted defaults and numeric normalization |
| Source accepted a write but response was lost | Durable operation state, stable key/source query, reconciliation state; unknown outcome blocks retry | Crash/timeout after source commit and restart/reconcile exercise |
| SQL/API overfetch or prompt exfiltration | Read-only source credentials, approved query templates, field filtering before context, response budgets and egress allowlist | Data-minimization and query-budget tests; network policy review |
| Tenant/workspace data leaks through cache | One organization per install; scoped cache keys, no public cache for authenticated data, server-side authorization on every retrieval | Cross-principal and cache-hit authorization tests |
| MCP server description poisons tool use | Admin registry, pinned tool schemas, allowlist, egress boundary, per-call server authorization, explicit upgrade review | Malicious tool-name/schema/content fixture and outbound network tests |
| Malicious generated UI invokes unlisted operation | JSON AppSpec only, strict schemas, catalog renderer, no eval/dynamic import, server ignores client-supplied effect authority | Reject script/component injection and unregistered capability references |
| Secret leaks in log, audit, crash dump or prompt | Secret references, redaction, structured allowlist logging, short-lived tokens, access-controlled audit | Secret canary scan in logs, prompt fixtures, and failure paths |
| Dependency or image compromise | Lockfile, pinned actions, Dependabot, SBOM, dependency/license audit, minimal base image, signed release artifacts when available | CI artifact and release checklist |
| Admin publishes accidental/unreviewed behavior | Two-person review where policy requires, immutable release digest, clear diff and readiness gates | Publish audit trail and rollback/disable exercise |
| Denial of service via large/recursive query | Time/row/byte/depth/parallelism/context budgets, per-principal rate limits, cancellation | Load/limit test and bounded error response |

## Authentication and authorization

- Production uses configured OIDC Authorization Code + PKCE; no password store in v1.
- Distinguish user-delegated source access from an installation/service identity. Record both requesting user and effective source principal. Service-identity use requires an explicit system-owner grant, narrow operation scope, expiry/rotation, and a visible policy decision; never imply it is user impersonation.
- Browser session cookie: `Secure`, `HttpOnly`, `SameSite` appropriate to deployment, short idle/absolute lifetime, rotation, CSRF token for unsafe requests. Validate issuer, audience, signature, expiry, nonce, and allowed redirect URI.
- External API/service clients use scoped tokens with expiry and rotation. Never accept a caller-provided user ID as the authenticated actor.
- Authorization is deny-by-default and evaluated in the kernel on every query, capability call, package publish, approval, and action submit. Recheck immediately before external side effect.
- Define explicit grant evaluation order: deny overrides allow; workspace/platform role grants are intersected with app/package/capability grants and source identity scope. Missing/unknown attributes deny. Any decision cache is short-lived and keyed by principal, package/policy revision and capability; sensitive actions are re-evaluated at dispatch.
- Source credentials are held by a narrow worker/connector and never passed to the browser, model, skill, or MCP response.
- Deployment is single organization per installation. This is not a substitute for future shared-tenant isolation controls.

## Secret and data protection

Production secret encryption keys come from a customer secret/KMS provider; database contains references and encrypted envelopes only where necessary. Rotate keys and credentials; redact values; document backup encryption and restore access. Default telemetry omits business content, prompts, tool arguments, and source payloads. Any opt-in diagnostic bundle is scoped, previewed, and redacted before export.

Model egress is an explicit data policy: administrators choose permitted provider endpoints and data classifications; `restricted` data is excluded by default. Before context construction, the kernel filters fields/documents and displays the configured destination/retention setting. No provider fallback occurs if the selected endpoint is unavailable.

Temporal workflow histories and activity arguments are a sensitive persistence boundary. Store opaque intent references, effect digests and minimal state only; fetch minimum encrypted arguments inside the action worker. Configure history retention, namespace access, TLS, encryption and backup, and verify raw credentials/payloads are absent.

## LLM and extension safety

- Model provider names and endpoints are allowlisted by an administrator; no environment-based silent fallback.
- Prompt context carries explicit provenance and untrusted-content markers. System prompts are not an authorization control.
- Output is schema-parsed, bounded, and treated as an untrusted proposal.
- External MCP and Skills require version pinning, review, minimal grants, egress/network limits, and explicit update. Metadata, descriptions, prompts, and returned resources cannot grant rights.
- For HTTP MCP, implement the official protocol revision supported by the chosen SDK: verify resource-server token issuer, audience and scope; return protocol-correct `401`/`403`; publish protected-resource metadata; prevent token passthrough to downstream services; and map the authenticated MCP subject into the same kernel principal. Recheck operation-specific grants per tool call.
- Agent worker has no shell, filesystem, browser, arbitrary package install, or source credential in business runtime.

## Audit and incident response

Audit records include actor principal reference, decision, target, correlation/run/intent IDs, release/policy/connector revisions, effect digest, result/reconciliation status, and timestamp. Do not put secrets or complete personal/business payloads into audit records. Audit read/export is permission-gated and itself audited. Define customer procedures for credential revocation, source disconnection, release disablement, key rotation, backup restore, and action reconciliation.

Audit storage is append-only to application roles, uses constrained database permissions, and supports signed/hashed export to customer-controlled immutable storage where required. A hash chain within one database is tamper-evidence only; it does not protect against a privileged database administrator or full environment compromise.

## Release gate

Before enabling writes: complete a threat-model review, connector-specific source authorization and idempotency review, session/CSRF review, schema validation of every public boundary, dependency/license scan, data redaction exercise, action replay/unknown-outcome recovery exercise, and a security report channel. Record owners, evidence, and residual risks. Do not label the project SOC 2, ISO 27001 certified, or production-secure without external audit and applicable certification.

