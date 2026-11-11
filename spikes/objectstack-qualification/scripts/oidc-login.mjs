#!/usr/bin/env node
// Headless OIDC Authorization Code + PKCE probe for TP-02.
// Drives: ObjectStack SSO start -> Dex login (static password connector) ->
// ObjectStack callback -> session cookie. No browser, no token invented.
import crypto from 'node:crypto';

const HOST = process.env.TP02_HOST ?? 'http://localhost:3100';
const DEX = process.env.TP02_DEX ?? 'http://localhost:5556';
const EMAIL = process.argv[2];
const PASSWORD = process.argv[3];
if (!EMAIL || !PASSWORD) { console.error('usage: oidc-login.mjs <email> <password>'); process.exit(2); }

const jar = new Map();
function remember(setCookie, host) {
  if (!setCookie) return;
  for (const c of (Array.isArray(setCookie) ? setCookie : [setCookie])) {
    const pair = c.split(';')[0];
    const idx = pair.indexOf('=');
    jar.set(pair.slice(0, idx), { value: pair.slice(idx + 1), host });
  }
}
function cookieHeader(url) {
  const u = new URL(url);
  return [...jar.entries()]
    .filter(([, v]) => v.host === u.host)
    .map(([k, v]) => `${k}=${v.value}`).join('; ');
}

async function req(method, url, { form, json, follow = 'manual', followOrigin = null, max = 12 } = {}) {
  let current = url;
  for (let hop = 0; hop < max; hop++) {
    const headers = { cookie: cookieHeader(current) };
    // Origin is only meaningful for the ObjectStack JSON API.
    if (new URL(current).origin === new URL(HOST).origin) headers.Origin = HOST;
    let body;
    if (json) {
      headers['content-type'] = 'application/json';
      body = JSON.stringify(json);
    }
    if (form) {
      headers['content-type'] = 'application/x-www-form-urlencoded';
      body = new URLSearchParams(form).toString();
    }
    const res = await fetch(current, { method, headers, body, redirect: 'manual' });
    remember(res.headers.getSetCookie?.() ?? res.headers.raw?.()?.['set-cookie'] ?? null, new URL(current).host);
    const loc = res.headers.get('location');
    if (res.status < 300 || res.status > 399 || !loc) return { res, loc, body: await res.text() };
    if (follow === 'manual') return { res, loc, body: await res.text() };
    const next = new URL(loc, current).toString();
    if (follow === 'same-origin' && new URL(next).origin !== new URL(current).origin) {
      return { res, loc: next, body: await res.text() };
    }
    if (follow !== 'all' && followOrigin && new URL(next).origin !== new URL(followOrigin).origin) {
      return { res, loc: next, body: await res.text() };
    }
    current = next;
  }
  throw new Error('too many redirects');
}

// 1. Start SSO (domain-routed to Dex).
const start = await req('POST', `${HOST}/api/v1/auth/sign-in/sso`, {
  json: { email: EMAIL, callbackURL: `${HOST}/_console/` },
});
let startUrl = start.loc;
if (!startUrl) {
  // JSON envelope form: { url } or { data: { url } }
  try {
    const parsed = JSON.parse(start.body);
    startUrl = parsed.url ?? parsed.data?.url ?? null;
  } catch { /* not json */ }
}
if (!startUrl) {
  console.error('no redirect from sign-in/sso:', start.body.slice(0, 300));
  process.exit(1);
}
let dexAuthUrl = new URL(startUrl, HOST).toString();
console.log('1 SSO start ->', dexAuthUrl.slice(0, 120));

// 2. GET Dex authorize: with one connector it serves a connector link;
//    following it (with its own query string) redirects to the password form.
let authorize = await req('GET', dexAuthUrl);
const rawHref = authorize.body.match(/href="(\/auth\/local\?[^"]+)"/)?.[1];
let formActionUrl = null;
if (rawHref) {
  const connectorUrl = new URL(rawHref.replace(/&amp;/g, '&'), DEX).toString();
  authorize = await req('GET', connectorUrl, { follow: 'same-origin' });
  console.log('2 Dex connector selected');
}
// The served login HTML carries its own POST action (…/auth/local/login?back=…&state=…).
const actionAttr = authorize.body.match(/<form[^>]*action="([^"]+)"/)?.[1];
if (actionAttr) formActionUrl = new URL(actionAttr.replace(/&amp;/g, '&'), DEX).toString();
const loginPage = authorize;
if (!loginPage.body.includes('password') || !formActionUrl) {
  console.error('Dex did not serve a login form:', loginPage.body.slice(0, 300));
  process.exit(1);
}
console.log('3 Dex login form reached:', formActionUrl.slice(0, 90));

const afterLogin = await req('POST', formActionUrl, {
  form: { login: EMAIL, password: PASSWORD },
  followOrigin: DEX,
});
if (!afterLogin.loc || /Invalid|incorrect|error/i.test(afterLogin.body.slice(0, 200))) {
  console.error('Dex login rejected:', afterLogin.body.slice(0, 300));
  process.exit(1);
}
console.log('4 Dex authenticated -> ObjectStack callback');

// 5. Follow ObjectStack callback chain (cross-origin hop) back to console.
const finalHop = await req('GET', new URL(afterLogin.loc, DEX).toString(), { follow: 'all' });
console.log('5 callback final status:', finalHop.res.status);

// 6. Use the session cookie against an authenticated endpoint.
const me = await fetch(`${HOST}/api/v1/auth/get-session`, {
  headers: { cookie: cookieHeader(HOST) },
}).then((r) => r.json()).catch(() => null);
console.log('SESSION', JSON.stringify(me));
