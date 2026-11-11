# G5/G6/G7/G15 — permission, generic-write-containment and revocation matrix

All rows below were executed against the running production-shaped host
(`NODE_ENV=production`, PostgreSQL, compiled artifact, port 3100). The
executable, repeatable form of this matrix is **`scripts/live-matrix.mjs`**
(35 assertions; `scripts/provision-app.mjs` creates the synthetic users,
positions, records and runtime grants idempotently). Result of the latest
run: **35 checks passed, 0 failed**.

## Principals

| Principal | Identity | Business grants |
|---|---|---|
| anonymous | none | none |
| planner | email/password, position `maint_planner` | read work orders; RLS narrows to `region == 'north'`; only role that sees `internal_cost` |
| technician | email/password **and** an external OIDC user in the same position | read work orders RLS-narrowed to `assignee_email == current_user.email`; `internal_cost` masked; federated parts read with `unit_cost` masked; holds capability `maint.request_spare` |
| owner | bootstrap platform admin | wildcard admin |

Seeded data (synthetic): `WO-N-1`/`WO-N-2`/`WO-S-1`/`WO-S-2`/`WO-N-9`
covering region × assignee combinations, plus a 3-row external parts catalog.

## Transport floor (six-gate chain, measured at every enabled surface)

| Surface | anonymous | planner/tech write attempts |
|---|---|---|
| `GET /api/v1/data/:object` | **401 UNAUTHENTICATED** | 403 where no object grant |
| `POST/PATCH/DELETE /api/v1/data/...` | 401 | **403 PERMISSION_DENIED** on both business objects, all verbs |
| `/api/v1/mcp` initialize/tools.call | **401** (valid OAuth/API key required) | per-tool 403 in MCP error envelope |
| `/api/v1/meta/...` | 401 | authorized per metadata-plane FLS |
| `/api/v1/graphql` | **404** (surface removed) | — |
| PUT → collection route | 405 (only PATCH on `/data/:object/:id` exists) | — |

Generic-write containment was probed as **8/8 denials**: POST/PATCH/DELETE on
`maint_qual_work_order` and POST on `maint_qual_spare_request`, for both the
planner and the technician, over REST. The same operations through the MCP
tools `create_record`/`update_record`/`delete_record` return the permission
denial in the tool result (`isError: true`) — MCP is a principal-bound bridge
through the same gates, not a second authority.

## Object / record / field results (representative rows)

| Probe | Expected | Actual |
|---|---|---|
| planner list work orders | only north rows | `WO-N-1, WO-N-2, WO-N-9` |
| technician list work orders | only rows assigned to them | `WO-N-1, WO-S-1, WO-N-9` (the last assigned to the OIDC tech user) |
| planner reads `internal_cost` | number visible | visible |
| technician reads `internal_cost` | stripped | key absent on every record |
| technician filters by `internal_cost` | 403 (predicate oracle closed) | 403, message names the hidden field |
| technician `describe_object` over MCP | name/type/label of hidden field visible (metadata) | **name visible** — see finding M-1 |
| planner reads federated parts | 403 (no grant) | 403 PERMISSION_DENIED |
| technician federated parts | 3 rows, `unit_cost` masked, sort/filter by it → 403 | as expected |
| technician/owner POST federated part | refused for everyone by the datasource gate | 403 `EXTERNAL_WRITE_FORBIDDEN` for **both** (double opt-in off) |

## Named action boundary (`maint_request_spare`)

| Probe | Expected | Actual |
|---|---|---|
| technician on assigned record, valid params | 200, effect created by elevated handler | 200 |
| identical repeat call | same deterministic effect, `idempotent:true` | 200 idempotent, no duplicate row |
| planner (no capability) | 403 capability gate | 403, names `maint.request_spare` |
| technician on record outside their RLS scope | 404 (no existence disclosure) | 404 `RECORD_NOT_FOUND`; `ctx.recordLoadDenied` honoured in handler |
| bad params (`part_no:"NOPE"`, qty 0) | 400 | 400 VALIDATION_FAILED |
| undeclared params (`code`, `status`, `requester_email`) | 400 param-schema rejection | 400 "Unknown action param" — **model cannot set effect fields** |
| same via MCP `run_action` as planner | denied per call | denied with capability message |
| produced effect row read by technician | 403 (business role has no read on the effect object) | 403; only the server/owner sees it |

The registered handler runs **elevated** (`isSystem`, upstream #3914/Actions
doc "Authorization inside an action") — this is exactly why the action is
modelled as the unique write path: the capability AND-gate + CEL visibility +
`recordLoadDenied` re-check inside the handler bound the elevation, and no
business permission set grants direct create/edit/delete on either business
object. An undeclared handler is refused at registration ("ungoverned
execution" guard logged as `[action-governance]`).

## RBAC/governance anti-escalation

- Technician inserting a `sys_user_position` row granting itself
  `maint_planner` → **403**: "requires tenant-level administration or a
  delegated adminScope (ADR-0090 D12) — plain CRUD grants on RBAC tables do
  not make a person admin".
- Generic write to `sys_user` as a business user → 405/403
  (`managedBy: 'better-auth'` identity objects suppress generic user-context
  CRUD; changes flow through `/api/v1/auth/admin/*`, itself platform-admin
  gated — creating the two business users required the owner session).
- No `'*'` wildcard is accepted in an authored package's permission set:
  `os validate` refuses "Permission … grants on object '*' which is not
  defined" (scripted: `scripts/probe-wildcard-validate.sh`). The only
  legitimate wildcard bundle is the platform-shipped `admin_full_access`.

## Revocation (G7), measured twice

- Removing the technician's `sys_user_position` row and replaying the **same
  bearer token on the next request** → 403 immediately (grants resolution has
  no positive TTL cache by default; `OS_AUTHZ_GRANTS_CACHE_TTL_MS` defaults to
  off; when enabled, watched authorization writes invalidate on the writing
  node and validity windows bound stale grants).
- Re-granting the position → 200 on the next request.
- API-key path: technician mints a key (`POST /api/v1/keys`), MCP works with
  `x-api-key`; setting `revoked:true` on `sys_api_key` (the documented
  self-service field; no DELETE route exists — the `/keys` family is POST +
  refusal-only verbs) makes the **next** MCP initialize answer
  `403 API_KEY_REVOKED` and REST answer 403, without restart.

## Residual findings the product must design around

- **M-1 (metadata disclosure):** the MCP `describe_object` tool returns the
  field name/type/label of a field the caller cannot read
  (`internal_cost`), while REST `/meta/object/...` correctly omits it
  (governed by `OS_ALLOW_UNMASKED_OBJECT_METADATA=false`). Data values are
  still masked and predicates refused, so this is name-only disclosure; the
  product should (a) request upstream parity for the MCP introspection tool,
  or (b) treat field names on federated/sensitive objects as non-secret while
  relying on the enforced data boundary. Tracked as a bounded limitation, not
  a critical bypass.
- **FLS is block-list/union today** (upstream ADR-0066 ⑧): a field is hidden
  only while *no* set the principal holds grants it readable, and there is no
  explicit deny-veto. Product packages must therefore keep sensitive fields
  in narrowly granted sets and add an authoring check; a future platform
  permission package cannot "subtract". Compose order also means the
  platform-shipped `member_default` baseline must never gain object
  wildcards (the 17.x regression removing that wildcard is the direct
  precedent — HotCRM measured 21/21 create bypasses before the fix).
- The external federation datasource must be environment config
  (`origin: 'code'` datasources are read-only at runtime, and inline
  credentials are refused by the authoring validator). The product's
  source-mapping extension therefore binds native IDs to connections created
  through the admin door — see [connector-findings.md](connector-findings.md).
