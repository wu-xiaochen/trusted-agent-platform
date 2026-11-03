# ADR-0003: ObjectStack Metadata with a Narrow Task-Safety Extension

- **Status:** Proposed; depends on ADR-0002 qualification
- **Date:** 2026-11-03
- **Requirements:** PR-02, PR-04, PR-05, PR-10
- **Backlog:** TP-03, TP-04, TP-09

## Context

Business vocabulary, source mappings, executable actions and generated UI must stay consistent. A second product-owned object/action/permission engine would make an ObjectStack-based implementation inconsistent and increase solo-maintainer scope. At the same time, task-first onboarding requires provenance, unknown/conflict state and readiness evidence that ordinary object metadata may not represent.

## Decision

If ADR-0002 passes, use ObjectStack metadata for objects, fields, relationships, actions, permissions and view/component metadata. Add only task-specific extension records for task goal, evidence/provenance, extracted/suggested/unknown/conflict/confirmed rule state, source-capability verification, freshness/partial/budget semantics, action idempotency/reconciliation evidence, canonical effect binding and release linkage.

The extension references stable ObjectStack IDs and digests; it does not redefine the same object/action/permission. The compiled release is immutable and addressed by ObjectStack metadata digest plus extension digest. If qualification fails, one replacement core is selected in a superseding ADR before product implementation.

This is a bounded executable business model, not a universal OWL reasoner or source of record.

## Consequences

Users can start with a task template and progressively confirm only relevant business facts. Model-generated metadata remains draft until a business owner/publisher review. Arbitrary scripts and dynamic code are excluded. ObjectStack schema evolution and the platform extension evolve together through an explicit compatibility/migration process.

## Reconsider when

The framework fails a trust-boundary gate, multiple real customers need formal semantics unavailable in the chosen model, or measured upgrade/fork burden outweighs reuse.

