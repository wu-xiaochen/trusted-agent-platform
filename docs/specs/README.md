# Implementation Specifications

Each TP item that is ready for coding receives a focused spec named `TP-XX-short-title.md`. Do not generate implementation from the full architecture document alone; a story should define one reviewable vertical behavior and its failure states.

## Required story sections

1. TP/PR IDs and user outcome
2. Current behavior / context and relevant ADRs
3. Scope and explicit non-goals
4. Actors, permissions, data classification, source authority
5. Flow and state transitions
6. API/package/schema changes and compatibility
7. Success, denied, partial, stale, conflict and recovery outcomes
8. Acceptance examples and evidence to collect
9. Files/packages likely to change and dependency direction
10. Verification commands and security review owners

## Ready-to-code order

Only TP-02 has a specification initially because the runtime selection is a high-impact dependency. Product feature stories become ready when TP-02 is accepted and the referenced interfaces are concrete. A proposed ADR is a design constraint to test, not accepted implementation evidence.

