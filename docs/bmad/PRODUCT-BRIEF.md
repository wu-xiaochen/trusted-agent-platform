# Project Brief

**Version:** 0.1.0 · **Date:** 2026-11-03 · **Status:** Planning baseline

## Vision

Make existing enterprise and industrial systems easier to connect to Agent capabilities by turning one cross-domain business task into a clear, governed, reusable service and task application.

## Problem

Enterprise teams have hard-to-change systems, fragmented APIs and data, undocumented rules, and little experience operating Agents. They can build one-off demos but struggle to connect real business authority, permissions, approvals, recovery, and a usable interface.

## Product outcome

A business owner and solution architect can go from task template to tested, governed, self-hosted task app with fewer expert interventions, and an operator can explain the state/evidence of every query and requested action.

## Target and first proof

- Initial adopter: industrial AI developers and enterprise solution architects with an engaged business owner and a source administrator.
- First scenario: maintenance preparation and spare-parts request over work-order and inventory sources.
- Second scenario: employee equipment request, to test reuse outside industrial systems.
- First delivery is read-only and preview-first; source write is enabled only after exact action, identity and reconciliation gates pass.

## Product thesis

Convenience comes from task-first guided setup and honest capability readiness. Trust comes from one shared business-service boundary and server-enforced access/effect/approval/recovery—not from model confidence or generated UI.

## Differentiation hypothesis

Compared with a general Agent builder, data/ontology tool, or integration workflow product, this platform makes onboarding, cross-system business meaning, source permissions, exception handling, durable operations, and task UI part of one auditable task path. This is a hypothesis to validate with users, not a competitive fact.

## Constraints and non-goals

One-person-led with AI coding; TypeScript ecosystem; self-hosted one organization per installation; Apache-2.0 project intent (verify every bundled asset/dependency). Exclude arbitrary code, raw SQL writes, multi-tenant SaaS, K8s-first, realtime device control, and universal no-API legacy integration in v1.

## Success measures

Observed time and expert involvement to set up/test a task; user comprehension of unknown/stale/partial/approval/unknown-outcome states; safe action recovery; second-task setup cost; clean external installation; independent connector contribution and reuse. GitHub Trending position is aspirational and not a product acceptance criterion.

## Architecture guardrails

Qualify ObjectStack as the preferred metadata/runtime foundation before implementing platform features; do not maintain a competing ontology/permission/UI core. Keep models untrusted; authenticate actual user; resolve package capabilities server-side; preserve source authority; use one durable coordinator; render only approved declarative UI components.

## Main risks

ObjectStack may fail OIDC/CRUD containment requirements; customer sources may lack user delegation or safe business commands; guided UX may still require expert intervention; framework operational burden may deter integrators; model-provider data handling may conflict with policy. Each has an explicit qualification or usability gate in `docs/backlog.json` and `docs/research/DESIGN-REVIEW.md`.

