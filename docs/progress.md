# Project Progress

Updated: 2026-11-03 · Phase: M0 design baseline + TP-02 runtime qualification complete · WIP limit: one product task unless explicitly agreed

## Handoff gate

TP-02 is complete with result **`qualified`**: ObjectStack 18.2.0 (release
commit `27f38ada498162835c2f1d56e6edabe18910b4ed`) is accepted as the
business-metadata runtime under ADR-0002's bounded conditions. The
qualification spike has executable, reproducible evidence (35/35 live
assertions over REST and MCP, external OIDC via Dex, read-only PostgreSQL
federation, backup/restore drill, durable-coordination simulation).

| Area | Status | Evidence / next step |
|---|---|---|
| Product strategy, PRD and UX specification | Design baseline; user validation pending under TP-03 | `docs/product/` |
| Business and system architecture | Authorized service boundary read against 18.2 hardening docs | `docs/architecture/` |
| Data, API, security and authorization | Six-gate anonymous-deny chain and fail-closed federation confirmed by execution | `spikes/objectstack-qualification/permission-bypass-matrix.md` |
| Framework and license research | **TP-02 qualified**; Apache-2.0 train with bounded adoption conditions | `spikes/objectstack-qualification/OBJECTSTACK-QUALIFICATION.md`, ADR-0002 |
| OIDC, federation, durable coordination | External Dex OIDC, sys_secret datasource credentials, ledger/outbox simulation proven | spike `oidc-notes.md`, `connector-findings.md`, `temporal-findings.md` |
| Code architecture and contribution process | Design baseline prepared | `docs/engineering/`, CONTRIBUTING.md, ADRs |
| Static task contract tooling | Static validator green; spike adds native-ID extension validator | `contracts/`, spike `scripts/` |
| Backlog tracking | TP-02 done/qualified | `docs/backlog.json` |
| Framework launch readiness | Runtime trust boundaries proven; no customer install/SLA yet | TP-03/TP-16 external evidence remains |
| Product runtime / real connectors / Agent / generated UI | Not product code (disposable spike only) | TP-04/TP-07/TP-10/TP-11; platform must add budget/provenance envelope (F-4) and effect-digest ledger (F-5) |
