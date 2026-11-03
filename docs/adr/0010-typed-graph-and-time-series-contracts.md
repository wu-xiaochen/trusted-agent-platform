# ADR-0010: Typed Graph and Time-Series Read Contracts

- **Status:** Proposed
- **Date:** 2026-11-03
- **Requirements:** PR-21
- **Backlog:** TP-22

## Context

Industrial and enterprise tasks may depend on typed relationships and temporal measurements. Flattening both into generic records loses semantics; standing up dedicated graph/time-series stores before there is workload evidence adds operational burden.

## Decision

First model relationships as bounded typed ObjectStack relations and use declared source API/relational query plans. A graph query may traverse only declared relation IDs with depth, node, time and data budgets. A time-series capability declares UTC range semantics, units, aggregation/resolution, quality and missing-interval behavior, source watermark, freshness and maximum points. Preserve provenance and current source authorization. Do not add a separate graph or time-series database until measured task workloads prove the need. Do not add industrial control commands to this read contract.

## Consequences

The first implementation can reuse existing relational and API adapters. A high-volume or graph-analytic use case can add a dedicated adapter behind the stable typed contract after tests and operational ownership are clear. Unsupported query shape must produce a bounded, actionable response.

## Security/data impact

Authorization and sensitivity filtering occur before model context. Traversal depth and time windows are bounded to prevent exfiltration/resource exhaustion. Source quality codes and units are retained rather than inferred from values.

## Validation evidence and reconsideration

Use synthetic timezone, unit, gap, stale watermark, denied-edge, excessive-depth, and excessive-point cases. Reconsider a physical graph/time-series store only after at least two observed tasks demonstrate a workload that federation and current relational indexing cannot meet.
