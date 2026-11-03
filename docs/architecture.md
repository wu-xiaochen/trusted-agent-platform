# Architecture Overview

The approved design is split into focused documents so implementation stories can cite the relevant boundary:

- [System architecture](architecture/SYSTEM-ARCHITECTURE.md): deployment, modules, technology direction and runtime flows.
- [Business architecture](architecture/BUSINESS-ARCHITECTURE.md): roles, executable business package, authority and action lifecycle.
- [Data architecture](architecture/DATA-ARCHITECTURE.md): source integration, federation, projections, permissions, provenance and persistence.
- [API contract](architecture/API-CONTRACT.md): versioning, resources, action endpoints, MCP, Skills and errors.
- [Domain package](architecture/DOMAIN-PACKAGE.md): exact task metadata and validation contract.
- [Action state machine](architecture/ACTION-STATE-MACHINE.md): effect binding, durable execution and recovery semantics.
- [Authorization matrix](architecture/AUTHORIZATION-MATRIX.md): roles, scopes, principal mapping, delegation and decision points.
- [Operations](architecture/OPERATIONS.md): self-hosted profiles, health, telemetry, backup, upgrades and incident recovery.
- [Threat model](architecture/THREAT-MODEL.md): security boundaries, threats, controls and release gate.
- [ADRs](adr/README.md): rationale, status and evidence needed for decisions.
- [Framework review](research/FRAMEWORK-REVIEW.md): reuse-first recommendation and qualification gate.
- [Design risk review](research/DESIGN-REVIEW.md): corrected design risks, residual evidence and assumptions.
- [Open-source adoption plan](product/OPEN-SOURCE-ADOPTION.md): project wedge, launch readiness and community evidence.
- [Backlog](backlog.json): stable TP IDs, dependencies, acceptance examples and milestone ownership for every PR requirement.

**Key decision:** ObjectStack is the preferred existing business-metadata runtime to qualify. It owns objects, actions, permissions, views and governed REST metadata if it passes the security and extensibility gate. This project adds guided setup and narrow evidence/action-safety capabilities missing for the product. It must not build a parallel ontology, permission, REST or UI schema engine. Exact versions and the decision to adopt are not locked until TP-02 passes.

The topology is a modular TypeScript application with separate model and side-effect workers, PostgreSQL for platform records, and one durable coordinator for cross-system writes. The source system remains authoritative. Read, preview, submit, approval and reconciliation are separate capabilities. Generated UI, Agent tools, APIs and MCP resolve through the same server-side business capabilities.

This is a detailed design, not an implemented or security-certified system. See [progress](progress.md) for evidence and open work.
