# ADR-0004: Federation-First Data Access and Bounded Projections

- **Status:** Proposed
- **Date:** 2026-11-03
- **Requirements:** PR-03, PR-06, PR-13
- **Backlog:** TP-05, TP-06, TP-07

## Context

Customers already have systems that own records and business state. Copying every record to a new platform increases implementation, privacy, freshness, synchronization, and deletion burden. Pure federation can be slow or weak for cross-source joins and source outages.

## Decision

Federate bounded reads by default. Use a source-owned API or read-only database role, enforce per-source budgets, and carry provenance/freshness/completeness. Add only task-scoped projections for a measured need such as repeated cross-source joins, source rate limits, or offline behavior. Every projection has explicit key, source watermark, mapping revision, permission/deletion sync, and retention rules.

Use PostgreSQL for platform metadata, package revisions, runs, action ledger, and small validated projections. Treat documents and time-series through source adapters first; add specialized storage only after a workload and lifecycle plan justify it.

## Consequences

The product may return partial or stale data and must explain it. There is no global cross-source snapshot. Authz occurs before model context creation and again at access boundaries. A later cache/index cannot retain privileges after revocation.

## Reconsider when

Measured latency/cost, join patterns, source availability, or customer retention requirements justify a specific projection/index. The new design must include sync lag, deletion, backfill, ACL changes, and source-of-truth semantics.
