# ADR-0011: Customer-Managed Private Connector Gateway

- **Status:** Proposed for post-v1 qualification
- **Date:** 2026-11-03
- **Requirements:** PR-22
- **Backlog:** TP-23

## Context

Enterprise systems often sit on private networks that the platform host cannot route to. Opening inbound source access or placing broad customer credentials in a public-facing control plane would create an unacceptable trust boundary.

## Decision

If validated demand requires private-network access, provide a customer-managed gateway that establishes outbound mTLS to the platform. The gateway runs pinned/signed connector builds, holds source credentials locally, validates each destination against an administrator allowlist, and serves only typed capability requests with a narrow workload identity. It has no inbound tunnel, arbitrary port forward, shell, browser or automatic package installation. The platform remains authoritative for user identity, capability grant, business policy and action ledger; the gateway rechecks signed, scoped grants and enforces its local egress boundary. Gateway/certificate revocation immediately disables dependent calls.

## Consequences

The gateway is an optional Compose/container deployment profile, not a Kubernetes prerequisite or general-purpose network proxy. It adds update, certificate, heartbeat, audit, compatibility and incident-response obligations. Do not build it before user demand and an independent threat review.

## Security/data impact

Threats include compromised gateway host, SSRF, DNS rebinding, signing-key compromise, replay, stale grant, command replay, credential theft and split-brain revocation. Use allowlisted destination/operation scopes, signed request expiry/nonce, local secret manager, adapter integrity checks, minimal returned fields, and audit references without payload/secret leakage.

## Validation evidence and reconsideration

Run gateway compromise/SSRF/revocation/certificate-expiry/replay tests in an isolated lab and demonstrate one source read and one disabled command. Enable production write through gateway only after the M4 write gates also pass. If safe revocation or source-specific identity cannot be proved, keep the gateway read-only or do not release it.
