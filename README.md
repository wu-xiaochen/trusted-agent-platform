# Trusted Agent Platform

Guided setup and governed task applications for existing enterprise and industrial systems.

[中文说明](README.zh-CN.md) · [Product strategy](docs/product/PRODUCT-STRATEGY.md) · [PRD](docs/product/PRD.md) · [Architecture](docs/architecture.md) · [Engineering guide](docs/engineering/IMPLEMENTATION-GUIDE.md) · [Progress](docs/progress.md) · [Roadmap](docs/roadmap.md)

**Status: product and engineering design baseline, not an operational agent platform.** This repository provides product strategy, PRD/UX, business/system/data/API/security architecture, framework research, ADRs, a draft business-task schema, local static validation, and project-management definitions. It does not yet connect real systems, run agents, enforce runtime permissions, or render generated applications.

The product starts from one real task. It guides business users and solution architects to describe the outcome, connect approved capabilities, confirm the rules that matter, test cases, and publish a controlled task application. The service layer exposes the same business capabilities to web, API, Agent, and MCP. Data access preserves source and freshness; writes require an exact effect preview, separate approvals where required, idempotency and reconciliation.

The first example is maintenance preparation and spare-parts request. The second-domain test is an employee equipment request. The project does not promise zero-change support for every legacy system and does not enter real-time PLC/DCS control loops.

## Check the existing static foundation

Python is used only for existing schema/contract tooling. The preferred product route is TypeScript and ObjectStack, pending the framework qualification gate in [ADR-0002](docs/adr/0002-runtime-and-frameworks.md); there is no Python product backend in this baseline.

```sh
python3 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements-dev.txt
python -m unittest discover -s tests -v
python -m scripts.check_contracts
```

These commands exercise only the current static foundation. They do not prove runtime authorization, connector safety, or recovery. A valid declaration is not proof of source access, business correctness, approval, or readiness.

## Design and contribution

Use [ADRs](docs/adr/README.md), the [framework review](docs/research/FRAMEWORK-REVIEW.md), [implementation guide](docs/engineering/IMPLEMENTATION-GUIDE.md), and the [backlog](docs/backlog.json) before implementation. Frameworks and protocol versions must pass the qualification gate before they become assumed dependencies.

General-purpose lakehouses, arbitrary generated code, universal legacy-system automation, shared-tenant SaaS, Kubernetes and real-time industrial control are outside the first release. Public issues and examples must use synthetic data. Do not add private documents or customer artifacts to the repository.
