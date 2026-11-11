#!/usr/bin/env node
// TP-02 idempotent environment provisioning for the live matrix.
// Creates synthetic users, positions, seeded work orders, the runtime
// external datasource + federated object + runtime permission grant.
// Requires a running host (OS health 200) and a platform-owner session.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const spikeDir = path.resolve(here, '..');
const localDir = path.join(spikeDir, 'local');
const B = process.env.TP02_BASE ?? 'http://localhost:3100';
const ORG = 'org_mw02e3j1glc384gs';

const OWNER_PW = 'owner-synthetic-pw-2026';
const USERS = {
  planner: { email: 'planner@tp02.local', pw: 'planner-synthetic-pw', name: 'Parker Planner' },
  technician: { email: 'technician@tp02.local', pw: 'technician-synthetic-pw', name: 'Terry Technician' },
};

const api = async (method, p, { token, body, raw = false } = {}) => {
  const res = await fetch(`${B}${p}`, {
    method,
    headers: {
      'content-type': 'application/json',
      // better-auth requires Origin on credentialed POST (CSRF); same-origin
      // browser calls carry it, so the provisioner does too.
      origin: B,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* non-json */ }
  return { status: res.status, json, text, ok: res.ok };
};

const fail = (m) => { console.error('PROVISION FAILED:', m); process.exit(1); };

const login = async (email, pw) => {
  const r = await api('POST', '/api/v1/auth/sign-in/email', { body: { email, password: pw } });
  return r.json?.token ?? null;
};

// 1. Owner: bootstrap account on a fresh DB, or sign in on an existing one.
let owner = await login('owner@tp02.local', OWNER_PW);
if (!owner) {
  const r = await api('POST', '/api/v1/auth/sign-up/email', {
    body: { email: 'owner@tp02.local', password: OWNER_PW, name: 'Owner Admin' },
  });
  owner = r.json?.token ?? null;
  if (!owner) fail(`owner signup: ${r.text.slice(0, 200)}`);
  console.log('owner bootstrapped');
}

// 2. Business users via the admin door (idempotent: ignore 400/409).
for (const u of Object.values(USERS)) {
  const r = await api('POST', '/api/v1/auth/admin/create-user', {
    token: owner,
    body: { email: u.email, name: u.name, password: u.pw, mustChangePassword: false },
  });
  if (!r.ok && !/already|exists/i.test(r.text)) fail(`create ${u.email}: ${r.text.slice(0, 200)}`);
}
const planner = await login(USERS.planner.email, USERS.planner.pw);
const technician = await login(USERS.technician.email, USERS.technician.pw);
if (!planner || !technician) fail('business user login');

// 3. Position assignments (idempotent via list-before-write).
const me = await api('GET', '/api/v1/auth/get-session', { token: owner });
const users = await api('GET', '/api/v1/data/sys_user?limit=50', { token: owner });
const idByEmail = Object.fromEntries((users.json.records ?? []).map((r) => [r.email, r.id]));

const assignPosition = async (email, position) => {
  const positions = await api('GET', `/api/v1/data/sys_user_position?limit=100`, { token: owner });
  const userId = idByEmail[email];
  const exists = (positions.json.records ?? []).some((r) => r.user_id === userId && r.position === position);
  if (exists) return;
  const r = await api('POST', '/api/v1/data/sys_user_position', {
    token: owner,
    body: { user_id: userId, position, organization_id: ORG },
  });
  if (!r.ok) fail(`assign ${position} to ${email}: ${r.text.slice(0, 200)}`);
};
await assignPosition(USERS.planner.email, 'maint_planner');
await assignPosition(USERS.technician.email, 'maint_technician');

// 4. Seed work orders (idempotent by code).
const seeds = [
  { code: 'WO-N-1', title: 'Compressor service (north, tech)', status: 'open', region: 'north', assignee_email: 'technician@tp02.local', internal_cost: 100, source_ref: 'EAM:WO-2026-0001', source_version: 'v1' },
  { code: 'WO-N-2', title: 'Pump overhaul (north, planner)', status: 'in_progress', region: 'north', assignee_email: 'planner@tp02.local', internal_cost: 200, source_ref: 'EAM:WO-2026-0002', source_version: 'v1' },
  { code: 'WO-S-1', title: 'Fan repair (south, tech)', status: 'open', region: 'south', assignee_email: 'technician@tp02.local', internal_cost: 300, source_ref: 'EAM:WO-2026-0003', source_version: 'v1' },
  { code: 'WO-S-2', title: 'Valve swap (south, other)', status: 'blocked', region: 'south', assignee_email: 'other@example.com', internal_cost: 400, source_ref: 'EAM:WO-2026-0004', source_version: 'v1' },
];
for (const s of seeds) {
  const found = await api('GET', `/api/v1/data/maint_qual_work_order?where=${encodeURIComponent(JSON.stringify({ code: s.code }))}&limit=1`, { token: owner });
  if ((found.json.records ?? []).length === 0) {
    const r = await api('POST', '/api/v1/data/maint_qual_work_order', { token: owner, body: s });
    if (!r.ok) fail(`seed ${s.code}: ${r.text.slice(0, 200)}`);
  }
}

// 5. External datasource via the runtime admin door (idempotent).
const dsDraft = {
  name: 'inventory_src',
  label: 'EAM source (external PostgreSQL, read-only)',
  driver: 'postgres',
  schemaMode: 'external',
  config: { host: '127.0.0.1', port: 55433, database: 'eam_source', username: 'tp02_ro', schema: 'inventory', statementTimeout: 2000 },
  external: { allowWrites: false, validation: { onMismatch: 'fail', checkOnBoot: true } },
  active: true,
  secret: { value: process.env.TP02_SOURCE_RO_PASSWORD ?? 'tp02-ro-synthetic-pw' },
};
let ds = await api('GET', '/api/v1/datasources/inventory_src', { token: owner });
if (ds.status === 404) {
  const created = await api('POST', '/api/v1/datasources', { token: owner, body: dsDraft });
  if (!created.ok) fail(`datasource create: ${created.text.slice(0, 300)}`);
} else {
  const { secret, ...patch } = dsDraft;
  const updated = await api('PATCH', '/api/v1/datasources/inventory_src', { token: owner, body: patch });
  if (!updated.ok) fail(`datasource patch: ${updated.text.slice(0, 200)}`);
}

// 6. Federated object through the metadata door (idempotent PUT).
const fed = await api('PUT', '/api/v1/meta/object/maint_qual_spare_part', {
  token: owner,
  body: {
    name: 'maint_qual_spare_part',
    label: 'Spare Part (external source)',
    datasource: 'inventory_src',
    external: { remoteName: 'spare_part' },
    fields: {
      part_no: { type: 'text' },
      description: { type: 'text' },
      stock_qty: { type: 'number' },
      unit_cost: { type: 'number' },
      warehouse: { type: 'text' },
    },
    sharingModel: 'private',
  },
});
if (!fed.ok) fail(`federated object: ${fed.text.slice(0, 300)}`);

// 7. Runtime permission set granting the technician federated reads with
//    unit_cost masked (idempotent PUT).
const ps = await api('PUT', '/api/v1/meta/permission/maint_technician_parts_runtime', {
  token: owner,
  body: {
    name: 'maint_technician_parts_runtime',
    label: 'Technician federated parts read (env-authored)',
    objects: { maint_qual_spare_part: { allowRead: true, readScope: 'org' } },
    fields: { 'maint_qual_spare_part.unit_cost': { readable: false, editable: false } },
  },
});
if (!ps.ok) fail(`runtime permission set: ${ps.text.slice(0, 300)}`);

const grantSet = async (userId, setName) => {
  const rows = await api('GET', '/api/v1/data/sys_user_permission_set?limit=100', { token: owner });
  const exists = (rows.json.records ?? []).some((r) => r.user_id === userId && r.permission_set === setName);
  if (exists) return;
  const r = await api('POST', '/api/v1/data/sys_user_permission_set', {
    token: owner,
    body: { user_id: userId, permission_set: setName, organization_id: ORG },
  });
  if (!r.ok) fail(`grant ${setName}: ${r.text.slice(0, 200)}`);
};
await grantSet(idByEmail[USERS.technician.email], 'maint_technician_parts_runtime');

fs.writeFileSync(path.join(localDir, 'tokens.env'),
  `OWNER=${owner}\nPLAN=${planner}\nTECH=${technician}\n`);
console.log('provisioning complete (tokens written to local/tokens.env)');
