# G15/G16 — MCP, skills and external-process protocol findings

## Inbound MCP (the surface agents use to operate the host)

Default-on at `/api/v1/mcp` (Streamable HTTP; `OS_MCP_SERVER_ENABLED=false`
opts out, after which authenticated callers get 404). Probed with a minimal
hand-written client ([`../scripts/mcp-call.mjs`](../scripts/mcp-call.mjs)):

- **Identity admission.** Anonymous initialize → 401
  ("a valid OAuth access token or API key is required"). Interactive
  clients use OAuth 2.1 (each deployment is its own authorization server,
  browser consent); headless clients use `x-api-key` / Bearer `osk_…`.
  API keys are minted by signed-in users (`POST /api/v1/keys`, secret
  returned once) and independently expire/inactivate/revoke; revoked keys
  fail the next initialize with `403 API_KEY_REVOKED`.
- **Tool surface** for the technician: 12 generic tools
  (`query_records`, `get_record`, `list_objects`, `describe_object`,
  `create/update/delete_record`, `aggregate_records`, `run_action`,
  `list_actions`, `validate_expression`, `resume_run`) plus the one opted-in
  business action. Objects/actions are NOT exposed to MCP by default; the
  action needed both `ai.exposed:true` and a ≥40-char description.
- **Per-call authorization, same kernel.** Every tool call resolves the
  principal and runs through the six-gate chain: create/update/delete on
  both business objects → `PERMISSION_DENIED`; queries return only the
  RLS-visible rows with FLS-masked fields; `run_action` enforces the
  capability (planner denied with the same message as REST), visibility and
  `recordLoadDenied`; undeclared params are schema-rejected. Tool-argument
  schemas themselves are strict and misnamed keys are refused with a
  corrective error (`objectName`/`recordId`/`data`, query `limit ≤ 50`).
- MCP tool metadata cannot widen grants: a caller cannot pass a system
  identity, another user id, or an arbitrary object; `ExecutionContext` is
  stamped server-side. Scope narrowing happens per OAuth consent and per
  the principal's grants (scopes advertised at discovery).
- The opt-in **stdio** transport is stricter than HTTP
  (`OS_MCP_STDIO_ENABLED=true` + `OS_MCP_STDIO_API_KEY=…`): missing key
  refuses boot, the key is re-verified per call, no `system`/unscoped
  bypass exists. Not booted in the spike (HTTP-only), assessed from the
  published behavior plus ADR-0101.

## Outbound connectors (metadata/scripted external MCP servers)

`@objectstack/connector-mcp` defaults to denying a metadata-declared
**stdio** process unless the host explicitly passes `declarativeStdio`
allowlist membership (upstream test pins: an allowlisted command starts,
`bash` rejects with "declarativeStdio allowlist"). Host-code ("hand-wired")
connectors remain a deliberate plugin-API path; metadata can never spawn a
shell. The spike composed the connector but declared no outbound MCP
servers, so product policy (host allowlist + auth) is the remaining
operator step, not a missing engine gate.

## Skills

`@objectstack/skills@18.2.0` is pure content: the installed tree contains
**69 Markdown + 23 JSON files and zero executable code** (SKILL.md bundles
plus references/evals). Skills are reviewed instruction/metadata bundles
loaded into the agent's context; they hold no runtime hooks and cannot
install processes. One packaging caveat: the scaffolder installs/copies the
catalog for one chosen agent runtime; nothing executes from it at host boot.

## AG-UI

The framework does not ship an AG-UI protocol package in 18.2. Agentic
interaction flows over the governed MCP server + the Console's native
metadata-driven UI. Per the project architecture, an AG-UI adapter — if
needed — is transport-only and must sit on the same kernel/action service;
the event stream grants no authority of its own. The durable-side event
contract is therefore a platform deliverable (TP-10/TP-12 territory), not
a capability qualified here.

## Net

Untrustred server descriptions/tool metadata are treated as proposals:
they reach the same typed ObjectQL/action gates as every REST call, and the
spike observed no path where MCP metadata grants identity or capability.
The one asymmetry found — `describe_object` field-name disclosure vs
masked `/meta` — is documented in
[permission-bypass-matrix.md](permission-bypass-matrix.md) (M-1).
