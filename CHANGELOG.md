# Changelog

All notable changes will be recorded here. This project is pre-release and has no operational platform release yet.

## Unreleased · 2026-11-03

- Added product strategy, detailed PRD and task-centered UX specification.
- Added business, system, data, API, domain-package, action-state, authorization, security and operations architecture.
- Added reuse-first framework review with ObjectStack qualification gate, BMAD-informed planning process, backlog and roadmap.
- Clarified that runtime adoption and external security/user validation remain unverified.
- Defined business objective and proposed pilot acceptance, connector compatibility tiers/onboarding, evidence-backed ontology authoring/validation, immutable AppSpec deployment, and per-action automation modes.
- Added ADR-0007 through ADR-0009 and TP-17 through TP-21 for the new design requirements; these remain proposed/planned and are not implemented evidence.
- Independent design review corrected the ObjectStack/DomainPackage/AppSpec single-source-of-truth boundary, added staged graph/time-series and private-network requirements, proposed falsifiable pilot targets, and documented current open-source launch gaps and competitor saturation.
- Added a bounded AI coding handoff contract and a staged TP-02 implementation plan with stop/go gates; downstream runtime implementation remains gated on qualification evidence.
- Completed TP-02: ObjectStack 18.2.0 (release commit `27f38ada…`) qualified on PostgreSQL with external OIDC (Dex), read-only federation, REST/MCP permission matrix, backup/restore drill and durable-coordination simulation; ADR-0002 accepted with bounded adoption conditions. Evidence: `spikes/objectstack-qualification/`.

