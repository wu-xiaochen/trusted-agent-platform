#!/usr/bin/env node
// Minimal MCP Streamable HTTP client for TP-02 probes.
// Usage: mcp-call.mjs <token> <method> [json-params]
// Performs the initialize/initialized handshake on a fresh session, then
// sends one JSON-RPC call and prints the raw response (SSE or JSON).
const base = process.env.TP02_BASE ?? 'http://localhost:3100';
const token = process.argv[2];
const method = process.argv[3];
const params = process.argv[4] ? JSON.parse(process.argv[4]) : {};
if (!token || !method) {
  console.error('usage: mcp-call.mjs <token> <method> [params-json]');
  process.exit(2);
}

const url = `${base}/api/v1/mcp`;
const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json, text/event-stream',
  Authorization: `Bearer ${token}`,
};

async function rpc(sessionId, payload) {
  const h = { ...headers };
  if (sessionId) h['mcp-session-id'] = sessionId;
  const res = await fetch(url, { method: 'POST', headers: h, body: JSON.stringify(payload) });
  const sid = res.headers.get('mcp-session-id') ?? sessionId;
  const text = await res.text();
  return { status: res.status, sid, text };
}

function unwrap(text) {
  if (text.startsWith('event:')) {
    const data = text.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim()).join('');
    return data;
  }
  return text;
}

let { status, sid, text } = await rpc(null, {
  jsonrpc: '2.0', id: 1, method: 'initialize',
  params: {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'tp02-probe', version: '0.1.0' },
  },
});
if (status !== 200) {
  console.log(JSON.stringify({ stage: 'initialize', status, body: text }));
  process.exit(0);
}
// notification (no id)
await rpc(sid, { jsonrpc: '2.0', method: 'notifications/initialized', params: {} });

const call = await rpc(sid, { jsonrpc: '2.0', id: 2, method, params });
console.log(JSON.stringify({ status: call.status, body: JSON.parse(unwrap(call.text) || '{}') }));
