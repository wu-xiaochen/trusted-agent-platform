# Implementation Guide and Repository Structure

**Version:** 0.1.0 · **Status:** Design baseline · **Updated:** 2026-11-03

AI coding teams must follow the [AI Coding Team Handoff Contract](AI-CODING-HANDOFF.md). The first implementation work item is the [TP-02 Runtime Qualification Plan](../superpowers/plans/2026-11-03-runtime-qualification.md); product runtime coding is gated on its evidence and ADR-0002.

## Repository layout

Use a pnpm monorepo and qualify ObjectStack as the first reuse path. Create directories when the first corresponding task is ready; do not add empty placeholder packages. `apps/*` are deployable processes. `plugins/*` extend ObjectStack using its supported plugin contracts. `packages/*` contain only platform-specific contracts/adapters that ObjectStack does not already supply. `examples/*` are synthetic, self-contained product demonstrations.

```text
trusted-agent-platform/
├── apps/
│   ├── platform/               # ObjectStack host, plugin assembly, config
│   ├── console/                # React/Vite guided builder and task-app shell
│   ├── agent-worker/           # isolated provider calls and untrusted planning
│   └── action-worker/          # Temporal activities with narrow source credentials
├── plugins/
│   ├── task-governance/        # evidence, rule decisions, readiness extensions
│   ├── connector-openapi/      # bounded HTTP source adapter
│   ├── connector-postgres-ro/  # scoped read-only SQL adapter
│   ├── action-safety/          # canonical effect, intent ledger, reconciliation ports
│   ├── agent-runtime/          # provider/harness adapter and policy gate
│   ├── app-studio/             # guided setup and controlled AppSpec publishing
│   └── mcp-governance/         # OAuth identity mapping and capability allowlists
├── packages/
│   ├── platform-extensions/    # only task-specific JSON Schema/Zod extensions
│   ├── temporal-adapter/       # durable coordinator port implementation
│   ├── telemetry-redaction/    # structured tracing/log and redaction helpers
│   └── testkit/                # synthetic fixtures, connector contracts and fakes
├── examples/
│   └── maintenance/            # synthetic sources, package, cases, expected outcomes
├── contracts/                 # published JSON Schema contracts
├── docs/                       # product, architecture, ADRs, specs and runbooks
├── deploy/compose/             # local and single-organization self-host profiles
├── scripts/                    # bounded repo maintenance commands only
├── .github/                    # CI, issue/PR templates, security reporting
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── turbo.json
├── package.json
├── tsconfig.base.json
├── eslint.config.js
├── .prettierrc.json
├── .nvmrc
└── AGENTS.md
```

The module list is the intended destination, not a request to generate empty packages. TP-02 starts with a minimal ObjectStack host and synthetic example. The product path adds the smallest set of governance plugins. Do not create replacement `domain-model`, `object-kernel`, `permission-engine`, REST generator, generic workflow engine, or UI-schema package when ObjectStack already supplies that responsibility. Custom modules may own the narrow platform-specific effect/reconciliation contract and customer-facing guided experience.

## Dependency direction

```text
ObjectStack spec/runtime/ObjectQL/security → platform governance plugins
platform plugins → approved ObjectStack capabilities and explicit external ports
console → ObjectStack client/API → same authorized business capability
agent-worker → same API/kernel → proposal only; action-worker → authorized durable intent only
```

Rules:

- ObjectStack spec and domain metadata define objects/actions/permissions. Platform extension package adds only missing task evidence, action safety, readiness and provider-independent contracts.
- ObjectStack plugins use plugin/service interfaces; the console does not import server internals.
- Business meaning and source commands are expressed once in the runtime metadata plus the narrow governance extension, not separately in each adapter.
- Web talks to API-generated client; it does not import server packages or connector code.
- Agent worker can request currently granted capabilities over authenticated internal API; it cannot call connector adapters directly.
- Action worker executes a durable intent through a narrow plugin port; it cannot decide that an intent is approved.
- No circular package dependencies. Enforce with lint/dep-cruiser in CI.

## TypeScript and package conventions

- ESM only; `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`, `noImplicitOverride: true`, `useUnknownInCatchVariables: true`.
- Ban `any` in product code except documented interop shim with a runtime validator. Narrow `unknown` at every boundary.
- Use named exports and package `exports` maps. No deep imports across packages.
- Reuse ObjectStack Zod schemas for framework metadata. Use Zod at platform extension boundaries and export JSON Schema/OpenAPI. Keep schemas deterministic and avoid schema/type drift.
- Use `Result` or typed application errors for expected domain outcomes; reserve exceptions for unexpected infrastructure failures. Map errors once at API boundary.
- Pass time, ID generation, provider, source, and durable coordinator dependencies explicitly. Do not hide mutable global clients in domain services.
- UTC instants in storage/API; ISO 8601 with timezone. Never use locale-formatted strings as data.
- Stable IDs use lowercase namespaced strings such as `maintenance.submit-request`; database primary keys stay opaque.
- Config is parsed once at startup from schema-validated environment variables; fail fast on missing/invalid production settings. Never sprinkle `process.env` reads through business code.
- Abort signals/timeouts flow from HTTP/run budgets through query and connector adapters.
- A provider response, source response, database JSON column, and extension result are parsed as untrusted input.

## Code organization inside a feature

Keep files close to a business capability and separate pure behavior from adapters:

```text
plugins/action-safety/src/actions/
├── create-intent.ts             # use case orchestration
├── create-intent.spec.ts         # focused unit behavior
├── action-intent.ts              # state/value rules
├── action-policy.port.ts         # application port
├── action-ledger.port.ts         # persistence contract
└── index.ts                      # intentional public surface
```

Do not create giant `utils.ts`, generic CRUD services, universal “agent manager”, or a second business-rule language hidden in prompt text. A use case owns its transaction and emits domain events only after its invariant is satisfied.

## Naming and style

- `camelCase` variables/functions; `PascalCase` types/classes/components; `SCREAMING_SNAKE_CASE` for environment keys and truly constant error IDs.
- Files are `kebab-case`; React components are `PascalCase.tsx` only when component-centric naming materially helps navigation. Public IDs do not include framework names.
- Boolean names state a property (`isPublished`, `canSubmit`); command names use verbs (`previewAction`, `publishPackage`).
- Avoid ambiguous abbreviations and overloaded words such as `context`, `data`, `status`, and `result` without a domain qualifier.
- Add comments for business/security reasons and non-obvious invariants, not to narrate syntax.
- Format with Prettier; lint with ESLint flat config plus TypeScript ESLint, import/order and no-floating-promises rules. Do not add formatting-only style disputes to PRs.

## Database and migration rules

- Use the qualified ObjectStack SQL driver and its supported migration path. If the platform needs raw SQL migrations or a repository adapter not covered by ObjectQL, document that specific gap; do not add a second general ORM without an ADR.
- Never run schema `push` against production. Migration is forward-only by default, explicit about lock/downtime, and includes a rollback/recovery note.
- Use transaction boundaries for local ledger + outbox. External source effects cannot join the PostgreSQL transaction.
- Every new state transition documents allowed prior states, concurrency behavior, idempotency, and audit events.
- Use unique constraints and optimistic version checks for publish, approval, and action intent; do not rely only on application-level “check then insert.”
- Minimize payload storage. Store large evidence/documents in an optional object store by reference with retention policy; do not place raw documents in audit JSON.

## API and schema rules

- Use ObjectStack-generated routes only for operations that preserve the action boundary. Define request/response schemas and export OpenAPI 3.1 for public business APIs.
- Pin and document the OpenAPI generator; generate a typed web client from the committed API spec. CI checks regenerated diff.
- Every endpoint declares authn, authz capability, input limit, idempotency behavior, error codes, audit event, and rate/budget policy.
- Use plural nouns for resources, `:verb` actions for commands only when resource/state transition is explicit; do not expose ORM models.
- Disable or gate generic ObjectStack create/update/delete routes for source-owned business objects. `POST` commands that may repeat require idempotency semantics. `GET` never causes a business side effect. `DELETE` on an operation cancels orchestration only if the source effect can safely be stopped; otherwise use a separate cancel/reconcile command.
- Compatibility changes require a contract update, migration note, and ADR for security/state changes.

## Agent and harness rules

- Keep a provider-neutral `ModelClient` and a runtime-neutral `AgentRuntime` port. Select one concrete harness only after TP-02; no public package exports framework-specific state.
- Tools are generated from the authenticated actor's allowed published capability list for the current run. The list may narrow during a run; it cannot silently expand.
- Model tool input is schema-validated. Kernel authorization occurs for every call, not once when the prompt is built.
- Tool response is bounded, sensitivity-filtered, provenance-bearing, and safe to place in model context.
- Tool calls that can change source state produce a preview or action intent. Agent cannot directly call connector write methods.
- Never send approval tokens or hidden authorization details to a model.
- Record model/provider/version, prompt template revision, tool schema/revision, and cost/latency metadata without default storage of full prompt or completion.

## UI and generated application rules

- React components are presentational. Queries/mutations use generated API client and TanStack Query; permission/readiness state comes from server.
- Use semantic HTML, keyboard operation, focus management, accessible labels, and no color-only states.
- Components are catalogued, versioned, JSON-schema validated, and rendered from an allowlist. Never call `eval`, dynamically import model-selected code, or compile arbitrary JSX.
- Escape all source/model text. Rich text is sanitized with an allowlisted renderer; remote HTML and SVG are not trusted.
- Confirmation displays server-canonical effect data. Disable submit when release, policy, connector, effect digest, or identity is stale.
- Persist drafts with optimistic revision checks; published app specs are immutable.

## Observability rules

- Structured logs include correlation, run, intent, connector, and release IDs; do not include secrets, access tokens, full prompts, source payloads, or sensitive field values.
- Metrics use bounded label cardinality; never label by user, record ID, prompt, or unbounded source value.
- Traces propagate W3C trace context across API, Temporal, model, and source boundaries; redact baggage before crossing trust boundaries.
- Health endpoints distinguish liveness from readiness. Readiness reports dependency state without exposing credentials or internal network details.

