# ADR-0008: AppSpec as the Canonical Generated Application and Release Artifact

- **Status:** Proposed
- **Date:** 2026-11-03
- **Requirements:** PR-10, PR-19
- **Backlog:** TP-09, TP-21

## Context

The product must generate both conventional business pages and Agent collaboration experiences, then freeze them for deployment. AG-UI standardizes Agent-to-client interaction events; it does not provide the platform's full application package, enterprise authorization, or release lifecycle.

## Decision

Use a versioned, declarative `AppSpec` rendered only by an approved component catalog and bound to published query/action capability IDs. The app studio and Agent may propose/edit the spec; the server validates and a named publisher releases it immutably. AG-UI is an optional Agent interaction/event adapter. Build a reproducible OCI image or static app bundle with a manifest and content digest. The artifact contains no credentials, source data, user grants, or frozen authorization. Environments resolve current secrets, identity, source grants, policy and runtime endpoint at deployment/runtime.

## Consequences

Generated apps are constrained to registered components until a reviewed extension model exists. The same released artifact can be promoted between environments; environment configuration is external. A component-catalog or schema change creates a new release. MCP Apps and A2UI may be interoperability options but are not canonical AppSpec authority.

## Security/data impact

Reject arbitrary scripts, dynamic imports, hidden source calls and unknown bindings. Validate field sensitivity, role declarations, action mode and source references. Runtime server rechecks every request. Sign/digest artifacts and record build inputs for provenance.

## Validation evidence and reconsideration

Prove representative list/detail/form/inbox/approval and Agent evidence/confirmation/status screens can be expressed without arbitrary code. Verify identical artifact digest promotion and runtime revocation behavior. Reconsider only if observed customer tasks repeatedly exceed the safe catalog and a sandboxed extension contract can be independently reviewed.
