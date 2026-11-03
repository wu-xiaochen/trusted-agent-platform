# ADR-0001: Modular Monolith and One Organization per Install

- **Status:** Proposed
- **Date:** 2026-11-03
- **Requirements:** PR-05, PR-14
- **Backlog:** TP-01, TP-02, TP-14

## Context

The product must keep one authorization and action model across UI, API, Agent, and MCP. A solo maintainer and AI-assisted contributors cannot safely evolve many independently deployed services before boundaries and scale are known. Enterprise customers need self-hosting and may have strict network boundaries.

## Decision

Start as a modular monolith with API, web, Agent worker, action worker, PostgreSQL, and Temporal as separate deployable processes in one versioned release. Keep business contracts and kernel modules in one repository. One installation serves one organization. Use explicit ports/adapters and process isolation where model egress or source write credentials require it.

## Considered options

- **Microservices from day one:** clearer process boundaries but high deployment, identity, versioning, and observability cost before ownership boundaries are proven.
- **Single process including model and source writes:** simpler demo, but weakens egress and credential isolation and complicates durable work.
- **Shared multi-tenant SaaS:** broader reach but adds a high-risk isolation and operations scope outside the first user's resources.

## Consequences

The repo enforces package boundaries and release compatibility; deployment may split later without changing domain contracts. Horizontal scale occurs per process after measuring load. Shared SaaS requires a new security ADR and isolation audit. This choice does not itself provide high availability.

## Reconsider when

Independent teams own stable domains, measured resource contention requires separate scaling, or multiple customers require a managed shared service.
