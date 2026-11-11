# G11/G12 — native metadata extension seam and controlled-view findings

## G11 — task evidence attached by stable native IDs, no parallel schema

The spike deliberately authors NO second object/action/permission engine.
Everything business-meaningful is native metadata, and the task layer is a
JSON envelope that only points at native IDs:

[`../extension/task-evidence.json`](../extension/task-evidence.json)
— envelope version, lifecycle (`draft`), native release pin, and four
extension sections (source mappings, rule decisions, readiness evidence,
automation policy refs). Examples of the rule:

- `nativeBundleRefs[]` reference only: `maint_qual_work_order`,
  `maint_qual_spare_request`, `maint_qual_spare_part` (runtime-provisioned
  federated object), action `maint_request_spare`, the view bound to the
  work-order object.
- `sourceMappings[]` bind a native object id to an external catalog entry
  with `mappingRevision`, `schemaFingerprint`, provenance state and identity
  mode — exactly the "facts ObjectStack does not own" listed in
  `docs/architecture/DOMAIN-PACKAGE.md`. No permissions, no source
  credentials, no effect digest inside.
- There is deliberately no `approved`/`confirm` key: a model-supplied
  boolean cannot grant anything; the effect digest/confirmation flow is a
  product service built ON TOP (see
  [temporal-findings.md](temporal-findings.md)).

### Narrow validator

[`../scripts/validate-extension.mjs`](../scripts/validate-extension.mjs)
resolves every native id against the compiled artifact plus the declared
runtime-provisioned set, enforces provenance/identity enumerations, and
rejects credential/approval keys. Negative cases measured:

- unresolved native object id → non-zero exit with "unresolved native object
  reference";
- `"approval": true` in the extension → rejected
  ("platformExtension must not carry approval").

## G12 — controlled native view/action renderer

`maint-qual` contains only native metadata for the task screen: a grid list
view with declared columns, a `simple` form, and the named action with CEL
`visible`/`requiredPermissions`/typed `params`. There is no project JSX, no
custom component, no arbitrary script for the view.

The published spec validators were probed with hostile declarations
([`../scripts/view-injection-probe.mjs`](../scripts/view-injection-probe.mjs)):

| Hostile declaration | Result |
|---|---|
| `defineView({list:{type:'run-arbitrary-code',…}})` | rejected — enum limited to grid/kanban/gallery/calendar/timeline/gantt/map/chart/tree |
| `defineAction({type:'eval-js',…})` | rejected by the action union (`invalid_union`, required bindings missing) |
| action missing `objectName` | rejected |
| permission set with `'*'` wildcard object grant | record-level Zod accepts the key shape but **`os validate`/`defineStack` rejects** it: "Permission … grants on object '*' which is not defined" (scripted end-to-end by `probe-wildcard-validate.sh`, which injects the set, asserts refusal and reverts) |
| extra params to the action call (`code`, `status`, `requester_email`) | REST and MCP both 400 "Unknown action param" — the model can submit only declared inputs; effect fields are server-derived inside the elevated handler |

Other framework controls verified in source/docs and runtime:

- Action CEL `visible`/`recordLoadDenied` fail closed; an action body's
  elevated `ctx.engine` cannot be driven to a record the caller cannot read
  without an explicit handler decision (the spike handler refuses with
  `RECORD_NOT_FOUND`).
- `confirmText` next to declared params is refused at authoring time (one
  decision, one dialog) — the param dialog's `description` carries the human
  confirmation text. `ai.requiresConfirmation` + the MCP `confirm` argument
  gate model-triggered confirmation; no boolean in tool output bypasses it.
- Inline action `body` executes in a server-side QuickJS sandbox
  (`OS_SANDBOX_*` CPU/wall budgets); the spike uses a registered handler
  instead, so no scriptable surface beyond the named handler exists.
- The Console document is served with a CSP (`OS_CONSOLE_CSP_CONNECT_SRC`
  extension allowlist; malformed entries refuse boot). A browser
  screenshot/render of the console page was not automated in this spike;
  the metadata/API enforcement points (which the UI only mirrors) were all
  tested over HTTP and MCP.

## Gaps the platform extension/workflow must own

1. The server-resolved canonical effect descriptor (normalized args,
   release/policy references, digest), requester-vs-approver binding and
   digest expiry are platform concepts; ObjectStack actions return handler
   JSON but do not version/digest it.
2. Human approval queues exist upstream (`@objectstack/plugin-approvals`,
   flows with approvals) and were composed by the default host, but the
   spike did not wire an approval policy to the action; product design must
   decide whether to use that plugin or a platform-owned policy record.
3. Cross-release reference integrity on native VIEW metadata (view schema
   versioning when objects change) is a platform packaging concern.
