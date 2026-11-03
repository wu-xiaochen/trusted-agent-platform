# ADR-0007: Connector Onboarding and Compatibility Tiers

- **Status:** Proposed
- **Date:** 2026-11-03
- **Requirements:** PR-03, PR-15, PR-16
- **Backlog:** TP-05, TP-17

## Context

Enterprise systems vary in protocol, authentication, schemas, network placement and quality of documentation. “Connect any system” is not a verifiable promise. A safe, low-friction connection flow must reduce setup work while exposing which capabilities were actually verified.

## Decision

Use versioned connector adapters with explicit support tiers (`native`, `beta`, `custom`, `unsupported`) and operation-level reports. First onboarding path imports OpenAPI or configures REST manually, sets a credential reference through a secret-safe admin flow, discovers operations without executing commands, performs bounded read verification, and maps selected operations to task capabilities. Add other protocols only through measured demand and contract-tested adapters. Credentials stay outside Agent context and app release artifacts. Customer-managed private-network gateway is a later deployment profile with its own trust review.

## Consequences

The product can be honest and useful with imperfect legacy APIs: import what exists, show manual mapping and unsupported authentication, and provide a documented adapter port. Connector count is not the success metric; supported capability coverage and setup outcomes are. Support badges require recorded contract evidence and compatibility versions.

## Security/data impact

OpenAPI descriptions, endpoint metadata, examples and source responses are untrusted. Protect import/test from SSRF, external reference expansion, oversized payloads, unsafe redirects, secret leakage and unintended command execution. All queries remain subject to current user/source authorization and bounded budgets.

## Validation evidence and reconsideration

Validate with one API-described source and one manually configured source. Reconsider native protocol priority after at least five target-user connection exercises and actual integration demand. No protocol other than the qualified initial set is claimed as supported without passing connector contract tests.
