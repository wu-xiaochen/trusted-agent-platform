# ADR-0006: Controlled Agent UI, MCP, and Skills Boundary

- **Status:** Proposed
- **Date:** 2026-11-03
- **Requirements:** PR-05, PR-10, PR-11
- **Backlog:** TP-09, TP-10

## Context

The platform must support generated task interfaces and Agent-to-service interoperability. Protocol compliance or a natural-language extension description is not an authorization decision. Arbitrary generated UI code can reach browser and application privileges.

## Decision

Generate a declarative, versioned `AppSpec` that can reference only catalog components and published capability IDs. The server validates and publishes it; the browser renders allowlisted components and calls authenticated APIs. AG-UI is an optional interaction/event transport, not the UI authority or action ledger. MCP exposes the same published capabilities through the same authz kernel. External MCP tools and Skills are registered, pinned, reviewed, and granted narrowly; metadata is untrusted.

## Consequences

The user cannot request any arbitrary React/JavaScript component in v1. A bounded catalog and explicit extension process keep runtime and upgrade behavior reviewable. Protocol adapters may be replaced while the business package and API remain stable.

## Reconsider when

User research shows the controlled catalog blocks important workflows, and a sandboxed extension contract can be reviewed for permissions, provenance, CSP, supply chain, compatibility, and revocation.
