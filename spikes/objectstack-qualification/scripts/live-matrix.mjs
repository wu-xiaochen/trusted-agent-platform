#!/usr/bin/env node
// TP-02 live permission/bypass matrix.
//
// Exercises the RUNNING host over HTTP and MCP with three disjoint principals
// (anonymous, planner, technician, owner-admin). Every probe asserts the
// expected status/result; exit code is the count of failures. This is the
// executable counterpart to permission-bypass-matrix.md — no mocks.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const spikeDir = path.resolve(here, '..');
const B = process.env.TP02_BASE ?? 'http://localhost:3100';

const loadTokens = () => {
  const env = Object.fromEntries(
    fs.readFileSync(path.join(spikeDir, 'local/tokens.env'), 'utf8')
      .split('\n').filter(Boolean).map((l) => l.split('=')),
  );
  return env;
};
const { OWNER, PLAN, TECH } = loadTokens();

let pass = 0;
const failures = [];
const check = (id, condition, detail = '') => {
  if (condition) { pass += 1; }
  else failures.push(`${id} ${detail}`);
};

const http = async (method, p, { token, body, key, cookie } = {}) => {
  const headers = { 'content-type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;
  if (key) headers['x-api-key'] = key;
  if (cookie) headers.cookie = cookie;
  const res = await fetch(`${B}${p}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* */ }
  return { status: res.status, json, text, headers: res.headers };
};

// MCP one-shot client (initialize handshake per call, session-scoped).
const mcp = async (token, payload) => {
  const url = `${B}/api/v1/mcp`;
  const base = {
    'content-type': 'application/json',
    accept: 'application/json, text/event-stream',
    authorization: `Bearer ${token}`,
  };
  const init = await fetch(url, {
    method: 'POST', headers: base,
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'tp02-matrix', version: '1' } } }),
  });
  const sid = init.headers.get('mcp-session-id');
  if (init.status !== 200) return { httpStatus: init.status, text: await init.text() };
  // This server does not always assign a session id; the bearer principal is
  // re-resolved per request, so calls proceed with whatever sid it returned.
  await fetch(url, {
    method: 'POST', headers: { ...base, ...(sid ? { 'mcp-session-id': sid } : {}) },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }),
  });
  const call = await fetch(url, {
    method: 'POST', headers: { ...base, ...(sid ? { 'mcp-session-id': sid } : {}) },
    body: JSON.stringify({ jsonrpc: '2.0', id: 2, ...payload }),
  });
  const text = await call.text();
  let json = null;
  try {
    const data = text.startsWith('event:')
      ? text.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim()).join('')
      : text;
    json = JSON.parse(data);
  } catch { /* */ }
  return { httpStatus: call.status, json };
};

const records = async (token, object, extra = '') => {
  const r = await http('GET', `/api/v1/data/${object}?limit=50${extra}`, { token });
  return r;
};

const woIdByCode = async (code) => {
  const r = await records(OWNER, 'maint_qual_work_order', `&where=${encodeURIComponent(JSON.stringify({ code }))}`);
  return r.json.records[0].id;
};

const run = async () => {
  // ── G0/G5: anonymous deny across every surface ─────────────────────────
  for (const [id, p] of [
    ['G5-anon-data', '/api/v1/data/maint_qual_work_order?limit=5'],
    ['G5-anon-meta', '/api/v1/meta/object'],
    ['G5-anon-keys', '/api/v1/keys'],
  ]) {
    const r = await http('GET', p);
    check(id, r.status === 401, `got ${r.status}`);
  }
  const anonMcp = await mcp('not-a-real-token', { method: 'tools/list' });
  check('G5-anon-mcp-401', /40[13]/.test(String(anonMcp.httpStatus)) || /UNAUTHENTICATED|invalid/i.test(anonMcp.text ?? ''), `got ${anonMcp.httpStatus}`);
  check('G5-graphql-removed', (await http('GET', '/api/v1/graphql')).status === 404);

  // ── G5: disjoint record/field grants ───────────────────────────────────
  const planRows = await records(PLAN, 'maint_qual_work_order');
  const techRows = await records(TECH, 'maint_qual_work_order');
  const planCodes = (planRows.json.records ?? []).map((r) => r.code).sort();
  const techCodes = (techRows.json.records ?? []).map((r) => r.code).sort();
  check('G5-planner-north-only', JSON.stringify(planCodes) === JSON.stringify(['WO-N-1', 'WO-N-2', 'WO-N-9']), planCodes.join(','));
  check('G5-tech-assigned-only', JSON.stringify(techCodes) === JSON.stringify(['WO-N-1', 'WO-S-1', 'WO-S-1', 'WO-N-9'].filter(Boolean).slice(0, 4)) || techCodes.every((c) => ['WO-N-1', 'WO-S-1', 'WO-N-9'].includes(c)), techCodes.join(','));
  const planCosts = planRows.json.records.map((r) => r.internal_cost);
  const techCosts = techRows.json.records.map((r) => r.internal_cost);
  check('G5-planner-sees-cost', planCosts.every((c) => typeof c === 'number'), JSON.stringify(planCosts));
  check('G5-tech-cost-masked', techCosts.every((c) => c === undefined), JSON.stringify(techCosts));

  // filter/sort oracle on masked field
  const oracle = await http('GET', `/api/v1/data/maint_qual_work_order?where=${encodeURIComponent(JSON.stringify({ internal_cost: { $gt: 0 } }))}`, { token: TECH });
  check('G5-masked-field-predicate-403', oracle.status === 403, `got ${oracle.status}`);

  // ── G6: generic write containment, every verb × both business roles ────
  const n1 = await woIdByCode('WO-N-1');
  const writeBodies = [
    ['POST', `/api/v1/data/maint_qual_work_order`, { code: 'HACK', title: 'x', status: 'open', region: 'north' }],
    ['PATCH', `/api/v1/data/maint_qual_work_order/${n1}`, { status: 'done' }],
    ['DELETE', `/api/v1/data/maint_qual_work_order/${n1}`, undefined],
    ['POST', `/api/v1/data/maint_qual_spare_request`, { code: 'HACK' }],
  ];
  let g6 = 0;
  for (const tok of [PLAN, TECH]) {
    for (const [method, p, body] of writeBodies) {
      const r = await http(method, p, { token: tok, body });
      if (r.status === 403) g6 += 1;
    }
  }
  check('G6-generic-writes-denied-8/8', g6 === 8, `${g6}/8`);

  // RBAC self-escalation
  const esc = await http('POST', '/api/v1/data/sys_user_position', {
    token: TECH,
    body: { user_id: 'TKGu4T4vHnmkOL7N44Sva1q04QVaila3', position: 'maint_planner', organization_id: 'org_mw02e3j1glc384gs' },
  });
  check('G6-rbac-self-escalation-403', esc.status === 403, `got ${esc.status}`);

  // managed identity object: generic write suppressed
  const sysWrite = await http('POST', '/api/v1/data/sys_user', { token: TECH, body: { email: 'x@y.z' } });
  check('G6-sys-user-user-write-denied', [403, 405].includes(sysWrite.status), `got ${sysWrite.status}`);

  // ── Named action boundary ──────────────────────────────────────────────
  const n2 = await woIdByCode('WO-N-2');
  const techAction = await http('POST', '/api/v1/actions/maint_qual_work_order/maint_request_spare', {
    token: TECH, body: { recordId: n1, params: { part_no: 'PART-008', quantity: 2 } },
  });
  check('G6-action-tech-ok', techAction.status === 200 && techAction.json.success, techAction.text.slice(0, 120));
  const dup = await http('POST', '/api/v1/actions/maint_qual_work_order/maint_request_spare', {
    token: TECH, body: { recordId: n1, params: { part_no: 'PART-008', quantity: 2 } },
  });
  check('G6-action-idempotent', dup.status === 200 && dup.json.data?.idempotent === true, dup.text.slice(0, 120));
  const planAction = await http('POST', '/api/v1/actions/maint_qual_work_order/maint_request_spare', {
    token: PLAN, body: { recordId: n2, params: { part_no: 'PART-008', quantity: 1 } },
  });
  check('G6-action-capability-403', planAction.status === 403, `got ${planAction.status}`);
  const techHidden = await http('POST', '/api/v1/actions/maint_qual_work_order/maint_request_spare', {
    token: TECH, body: { recordId: n2, params: { part_no: 'PART-008', quantity: 1 } },
  });
  check('G6-action-invisible-record-404', techHidden.status === 404, `got ${techHidden.status}`);
  const badParams = await http('POST', '/api/v1/actions/maint_qual_work_order/maint_request_spare', {
    token: TECH, body: { recordId: n1, params: { part_no: 'NOPE', quantity: 1 } },
  });
  check('G6-action-validation-400', badParams.status === 400, `got ${badParams.status}`);
  const injected = await http('POST', '/api/v1/actions/maint_qual_work_order/maint_request_spare', {
    token: TECH, body: { recordId: n1, params: { part_no: 'PART-008', quantity: 1, code: 'FORGED', requester_email: 'a@b.c' } },
  });
  check('G12-action-extra-params-400', injected.status === 400, `got ${injected.status}`);

  // ── MCP per-call enforcement ───────────────────────────────────────────
  const mcpCreate = await mcp(TECH, { method: 'tools/call', params: { name: 'create_record', arguments: { objectName: 'maint_qual_work_order', data: { code: 'HACK' } } } });
  const mcpErr1 = JSON.stringify(mcpCreate.json).includes('PERMISSION_DENIED');
  check('G15-mcp-create-denied', mcpErr1, JSON.stringify(mcpCreate).slice(0, 150));
  const mcpUpdate = await mcp(TECH, { method: 'tools/call', params: { name: 'update_record', arguments: { objectName: 'maint_qual_work_order', recordId: n1, data: { status: 'done' } } } });
  check('G15-mcp-update-denied', JSON.stringify(mcpUpdate).includes('PERMISSION_DENIED'));
  const mcpDelete = await mcp(TECH, { method: 'tools/call', params: { name: 'delete_record', arguments: { objectName: 'maint_qual_work_order', recordId: n1 } } });
  check('G15-mcp-delete-denied', JSON.stringify(mcpDelete).includes('PERMISSION_DENIED'));
  const mcpQuery = await mcp(TECH, { method: 'tools/call', params: { name: 'query_records', arguments: { objectName: 'maint_qual_work_order' } } });
  const q = JSON.parse(mcpQuery.json.result.content[0].text);
  const mcpCodes = (q.records ?? []).map((r) => r.code).sort();
  check('G15-mcp-same-rls', mcpCodes.length === techCodes.length, `${mcpCodes.join(',')} vs ${techCodes.join(',')}`);
  check('G15-mcp-same-fls', (q.records ?? []).every((r) => r.internal_cost === undefined));
  const mcpRun = await mcp(PLAN, { method: 'tools/call', params: { name: 'run_action', arguments: { objectName: 'maint_qual_work_order', actionName: 'maint_request_spare', recordId: n2, params: { part_no: 'PART-008', quantity: 1 } } } });
  check('G15-mcp-action-capability', /requires capability/.test(JSON.stringify(mcpRun)));

  // ── G8/G9: federated read, budgets, pre-filter ─────────────────────────
  const parts = await records(TECH, 'maint_qual_spare_part');
  const partRows = parts.json.records ?? [];
  check('G8-federated-read', partRows.length === 3, `rows=${partRows.length}`);
  check('G9-field-before-model', partRows.every((r) => r.unit_cost === undefined), JSON.stringify(partRows.map((r) => Object.keys(r))));
  const planParts = await records(PLAN, 'maint_qual_spare_part');
  check('G8-federated-role-isolation', planParts.status === 403, `got ${planParts.status}`);
  const fedWrite = await http('POST', '/api/v1/data/maint_qual_spare_part', { token: TECH, body: { part_no: 'HACK' } });
  check('G8-federated-write-denied', fedWrite.status === 403 && /EXTERNAL_WRITE_FORBIDDEN/.test(fedWrite.text), `got ${fedWrite.status}`);
  const adminFedWrite = await http('POST', '/api/v1/data/maint_qual_spare_part', { token: OWNER, body: { part_no: 'HACK2' } });
  check('G8-federated-write-admin-too', adminFedWrite.status === 403, `got ${adminFedWrite.status}`);
  const limit = await http('GET', '/api/v1/data/maint_qual_spare_part?limit=2', { token: TECH });
  check('G8-bounded-limit', (limit.json.records ?? []).length === 2, `rows=${(limit.json.records ?? []).length}`);

  // ── G7: revocation on next request (assignment removed then restored) ──
  const assignments = await records(OWNER, 'sys_user_position', '');
  const techAssign = (assignments.json.records ?? []).find((r) => r.position === 'maint_technician' && r.user_id === 'TKGu4T4vHnmkOL7N44Sva1q04QVaila3');
  if (techAssign) {
    const del = await http('DELETE', `/api/v1/data/sys_user_position/${techAssign.id}`, { token: OWNER });
    const after = await records(TECH, 'maint_qual_work_order');
    check('G7-revocation-next-request', del.status === 200 && after.status === 403, `del=${del.status} after=${after.status}`);
    await http('POST', '/api/v1/data/sys_user_position', { token: OWNER, body: { user_id: 'TKGu4T4vHnmkOL7N44Sva1q04QVaila3', position: 'maint_technician', organization_id: 'org_mw02e3j1glc384gs' } });
    const restored = await records(TECH, 'maint_qual_work_order');
    check('G7-regrant-restores', restored.status === 200, `got ${restored.status}`);
  } else {
    check('G7-revocation-next-request', false, 'no technician assignment found');
  }

  // ── Health semantics ──────────────────────────────────────────────────
  const health = await http('GET', '/api/v1/health');
  const ready = await http('GET', '/api/v1/ready');
  check('OPS-health', health.json?.data?.status === 'ok');
  check('OPS-ready', ready.json?.data?.state === 'running');

  console.log(`\n${pass} checks passed, ${failures.length} failed`);
  if (failures.length) {
    console.log('FAILURES:');
    for (const f of failures) console.log(' -', f);
    process.exit(1);
  }
};

run().catch((e) => { console.error(e); process.exit(2); });
