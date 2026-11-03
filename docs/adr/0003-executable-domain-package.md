# ADR-0003: ObjectStack Metadata with a Narrow Task-Safety Extension

- **Status:** Proposed; depends on ADR-0002 qualification
- **Date:** 2026-11-03
- **Requirements:** PR-02, PR-04, PR-05, PR-10
- **Backlog:** TP-03, TP-04, TP-09

## Context

Business vocabulary, source mappings, executable actions and generated UI must stay consistent. A second product-owned object/action/permission engine would make an ObjectStack-based implementation inconsistent and increase solo-maintainer scope. At the same time, task-first onboarding requires provenance, unknown/conflict state and readiness evidence that ordinary object metadata may not represent.

## Decision

If ADR-0002 passes, use ObjectStack's native metadata as the only source for objects, fields, relationships, actions, permissions and views/components. A release envelope references the pinned native bundle by ID/digest and stores only task-specific extension records: task goal, evidence/provenance, business decisions, source mappings/capability verification, freshness/partial/budget evidence, action idempotency/reconciliation policy, effect binding, and release linkage. A platform AppSpec may add only app-level route/layout composition that the qualified native view metadata does not already provide; every binding points back to native IDs.

The extension references stable ObjectStack IDs and digests; it does not redefine object/action/permission/view/component schemas, generic REST semantics, or identity. Platform validation checks references and cross-boundary invariants; ObjectStack's qualified validators own native metadata validation. The compiled release is immutable and addressed by native metadata digest plus extension/app manifest digests. If qualification fails, one replacement core is selected in a superseding ADR before product implementation.

This is a bounded executable business model, not a universal OWL reasoner or source of record.

## Consequences

Users can start with a task template and progressively confirm only relevant business facts. Model-generated native-metadata proposals remain draft until authorized review. Arbitrary scripts and dynamic code are excluded. ObjectStack schema evolution and the platform extension evolve together through an explicit compatibility/migration process. If a required app view is unsupported natively, record that gap in TP-02/ADR rather than starting an independent view schema by default.

## Reconsider when

The framework fails a trust-boundary gate, multiple real customers need formal semantics unavailable in the chosen model, or measured upgrade/fork burden outweighs reuse.

