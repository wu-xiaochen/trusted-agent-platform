# G4 — external OIDC identity evidence

Goal: prove enterprise OIDC on a **real external issuer**, not the
development email login. Dex v2.42.0 runs as a disposable container
([infra/compose.yml](../infra/compose.yml), digest pinned in
[environment.md](environment.md)) with a static password connector and two
disjoint synthetic users.

## Wiring (reproducible)

1. Dex serves `http://localhost:5556` with one static confidential client
   (`tp02-qual`, Authorization Code, redirect to
   `/api/v1/auth/sso/callback/dex`).
2. The SSO surface is opt-in: `OS_SSO_ENABLED=true` (verified: without it the
   internal vendor route `/api/v1/auth/sso/register` answers 404 and
   `auth/config` reports `features.sso: false`).
3. The localhost IdP origin must be listed in `OS_TRUSTED_ORIGINS`, otherwise
   registration is refused with a public-routability error:
   "discoveryEndpoint URL … is not publicly routable: localhost … add its
   origin to trustedOrigins".
4. Provider registration through the platform-admin bridge
   `POST /api/v1/auth/admin/sso/register` (flat fields reshaped to the vendor
   nested `oidcConfig`; platform-admin gated):
   `{providerId:"dex", issuer, domain:"tp02.local", clientId, clientSecret,
   discoveryEndpoint, scopes}` → `{success:true,data:{providerId:"dex"}}`
   and `auth/config.features.sso` then reports true.

## Executable proof

`scripts/oidc-login.mjs <email> <password>` drives the complete headless flow:

1. `POST /api/v1/auth/sign-in/sso` → ObjectStack redirect to Dex `/auth`
   (state, PKCE `code_challenge`, nonce handled by the host);
2. connector selection → `/auth/local/login` form;
3. credentials POST → Dex issues a code and 302s to the host callback;
4. host token exchange + account link/JIT provisioning;
5. session verified with `GET /api/v1/auth/get-session`.

Measured result for `sso.tech@tp02.local`: a new user (`id …`, positions
`["org_member","everyone"]`, `isPlatformAdmin:false`) was provisioned through
the SSO identity and got a valid session — without any email/password
credential existing in the host.

## Identity mapping, session, revocation

- Subject: with `@better-auth/sso@1.7.x` the federated subject is hard-wired
  to OIDC `sub` (the older configurable claim map was retired upstream; a
  `mapId`/`sub` override is refused) — confirmed in the installed vendor code
  and in the bridge's own comments. Email/name map from token claims.
- Session: same better-auth session family as local login (7-day token,
  HttpOnly, SameSite=Lax cookie; bearer token returned in JSON).
- Revocation: API-key revocation propagates on the next request (see
  [permission-bypass-matrix.md](permission-bypass-matrix.md)); sessions are
  managed in `sys_session` and sign-out/revocation endpoints exist. The
  authorization grants cache (`OS_AUTHZ_GRANTS_CACHE_TTL_MS`, **default off**)
  is invalidated synchronously on the writing node and at the next
  validity-boundary; with no cluster bus a loud boot warning names the bound.
- OIDC-only enforcement exists (`OS_AUTH_SSO_ONLY`) but was not switched on,
  because the spike still needs the local break-glass owner for admin doors.

## Negative cases

- Wrong Dex password: Dex re-renders its login error; no host session is
  created (script exits at "Dex login rejected").
- Fresh OIDC identity with no business position: work-order read →
  `403 PERMISSION_DENIED`; named action → `403 … requires capability
  [maint.request_spare]`. After the admin assigns `maint_technician`, the
  same OIDC session immediately reads exactly its assigned rows
  (`assignee_email == current_user.email` RLS) with `internal_cost` masked —
  external identity feeds the same current_user chain the local users use.

## Known limitations recorded

- Localhost HTTP: OAuth browser flow on non-localhost requires TLS; the
  headless script talks loopback only. This matches product deployment
  (corporate IdP over HTTPS).
- Logout at the IdP side is Dex's responsibility; host-side session expiry
  and revocation are the platform's. SSO session invalidation timing at the
  very end of the 7-day lifetime was not separately probed.
