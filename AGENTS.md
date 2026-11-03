# Development contract

Read `docs/product.md`, `docs/architecture.md`, `docs/architecture/THREAT-MODEL.md`, `docs/architecture/AUTHORIZATION-MATRIX.md`, `docs/engineering/IMPLEMENTATION-GUIDE.md`, `docs/adr/README.md`, and the relevant specification before implementation. Track work through stable IDs in `docs/backlog.json`. Keep WIP at one product task unless explicitly agreed otherwise. Complete TP-02 before depending on ObjectStack runtime implementation; it is a preferred reuse route, not yet qualified.

- Business users start with tasks/examples; do not require ontology or harness expertise.
- Business writes must cross the authenticated action boundary. No raw CRUD bypass through UI, MCP, scripts, or source credentials.
- The model, retrieved documents, MCP output, and UI declarations are untrusted inputs. They cannot grant identities, roles, approvals, source verification, or publish rights.
- Query authorization happens before content reaches a model. Preserve source/freshness/completeness and current permission checks on caches, exports and citations.
- Published definitions are immutable. Pins do not preserve revoked privileges. Source business systems retain authority over their facts and state machines.
- Confirmation uses a server-resolved effect descriptor. A model-supplied boolean is not approval.
- Unknown external outcomes require reconciliation. Do not blindly retry writes; one coordinator owns side-effect retries.
- Generated UI uses approved declarations and components. No arbitrary JS/React, automatic plugin installation, or shell tools in business mode.
- Use meaningful failing tests before changing trusted boundaries. Never weaken checks to make a build green.
- New runtime dependencies, public contracts, source identity mappings and state models require an ADR or an update to the relevant accepted decision.
- Prefer ObjectStack for object/action/permission/view metadata if TP-02 trust-boundary gates pass. Do not implement a parallel ontology, permission, REST, or UI schema engine. If ObjectStack fails a critical gate, record a superseding ADR before adopting one alternative.
- Do not commit real customer data, resumes, local paths, credentials, `.env` files, or hidden chat state.
- Report actual commands/results and limitations. Static validation is not runtime authorization. Future tests are not passing tests.

Actual baseline commands:

```sh
python3 -m unittest discover -s tests -v
python3 -m scripts.check_contracts
```

These checks cover the foundation only. Runtime typechecking, integration tests and recovery tests must be added with the corresponding executable modules; do not invent successful command results for unimplemented modules.
