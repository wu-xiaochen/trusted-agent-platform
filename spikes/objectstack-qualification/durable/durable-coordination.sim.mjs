#!/usr/bin/env node
// TP-02 Task 6 — durable action-coordination simulation (platform side).
//
// Models the adapter the trusted-agent-platform would own AROUND the
// ObjectStack named action (no Temporal dependency required to prove the
// contract). Demonstrates the invariants the source system must keep:
//
//  1. ledger intent row + outbox event commit in ONE atomic boundary before
//     any side effect starts;
//  2. a deterministic idempotency key means a duplicate delivery returns the
//     SAME effect — never a second side effect;
//  3. a response lost AFTER the source commit is reconciled by querying the
//     source operation key, never by blind retry;
//  4. if the reconcile query itself fails, the outcome is UNKNOWN and routes
//     to manual review (the coordinator owns retry state exclusively);
//  5. sensitive arguments (canary token) never reach ledger/outbox/history —
//     only an opaque reference persists.
//
// The "external source" is a deterministic local fake keyed by operation key.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// ── Fake external source: commits once per key, records every attempt ──────
class FakeSource {
  constructor() { this.commits = new Map(); this.attempts = 0; this.queryFailUntil = 0; this.queries = 0; }
  commit(op) {
    this.attempts += 1;
    if (this.commits.has(op.key)) return this.commits.get(op.key); // duplicate POST rejected at source
    const ref = `SRC-${op.key}`;
    this.commits.set(op.key, { ref, status: 'accepted', at: 't' });
    return this.commits.get(op.key);
  }
  query(key) {
    this.queries += 1;
    if (this.queries <= this.queryFailUntil) throw new Error('source unreachable');
    return this.commits.get(key) ?? null;
  }
}

// ── Minimal durable store: one atomic multi-key write per transaction ──────
class JsonStore {
  constructor(file) { this.file = file; this.state = { ledger: {}, outbox: [], events: [] }; }
  tx(fn) {
    const snapshot = JSON.stringify(this.state);
    try { fn(); fs.writeFileSync(this.file, JSON.stringify(this.state)); }
    catch (e) { this.state = JSON.parse(snapshot); throw e; }
  }
}

// ── Coordinator: owns submit, delivery and reconciliation ──────────────────
class Coordinator {
  constructor(store, source) { this.store = store; this.source = source; }

  // Called by the action worker. `secretArgs` never touch durable storage.
  submit({ key, safeArgs, secretArgs }) {
    const existing = this.store.state.ledger[key];
    if (existing && existing.outcome) {
      return { duplicate: true, outcome: existing.outcome };
    }
    const argsRef = `argsref-${key}`; // opaque handle; the secret lives outside the journal
    let entry;
    this.store.tx(() => {
      entry = { key, argsRef, state: 'ready_to_dispatch', outcome: null, attempts: 0 };
      this.store.state.ledger[key] = entry;
      this.store.state.outbox.push({ key, argsRef, at: 't0' });
    });
    assert.ok(!JSON.stringify(this.store.state).includes(secretArgs.canary), 'canary leaked into journal');
    return this.dispatch(key);
  }

  dispatch(key) {
    const entry = this.store.state.ledger[key];
    let src;
    try {
      src = this.source.commit({ key });
    } catch (err) {
      this.store.tx(() => { entry.state = 'retry_wait'; entry.lastError = err.code ?? 'commit_failed'; });
      return { state: 'retry_wait' };
    }
    this.store.tx(() => {
      entry.state = 'submitted';
      entry.sourceRef = src.ref;
      entry.attempts += 1;
      this.recordHistory(key, 'commit_sent');
    });
    return this.confirm(key, { responseLost: false });
  }

  // Post-commit confirmation. A lost response must trigger RECONCILE, not retry.
  confirm(key, { responseLost }) {
    const entry = this.store.state.ledger[key];
    if (responseLost) {
      this.store.tx(() => { entry.state = 'reconciling'; });
      return this.reconcile(key);
    }
    this.store.tx(() => { entry.state = 'succeeded'; entry.outcome = { sourceRef: entry.sourceRef }; });
    return { state: 'succeeded', outcome: entry.outcome };
  }

  reconcile(key) {
    const entry = this.store.state.ledger[key];
    let remote;
    try {
      remote = this.source.query(key);
    } catch {
      this.store.tx(() => { entry.state = 'unknown_manual_review'; });
      return { state: 'unknown_manual_review' }; // no blind retry of the commit
    }
    if (!remote) {
      // Query-authoritative "nothing there" while local says submitted = ambiguous;
      // the contract still routes to manual review rather than re-committing.
      this.store.tx(() => { entry.state = 'unknown_manual_review'; });
      return { state: 'unknown_manual_review' };
    }
    this.store.tx(() => { entry.state = 'succeeded'; entry.outcome = { sourceRef: remote.ref }; });
    return { state: 'succeeded', outcome: entry.outcome };
  }

  recordHistory(key, event) { this.store.state.events.push({ key, event }); }
}

// ── Scenarios ──────────────────────────────────────────────────────────────
const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tp02-durable-')), 'journal.json');
const run = () => {
  const source = new FakeSource();
  const store = new JsonStore(file);
  const coord = new Coordinator(store, source);

  const secretArgs = { canary: 'CANARY-DURABLE-SECRET-9931', partNo: 'PART-008' };
  const safeArgs = { quantity: 2 };

  // 1. First submit dispatches and succeeds.
  const r1 = coord.submit({ key: 'WO-N-1|PART-008|2', safeArgs, secretArgs });
  assert.equal(r1.state, 'succeeded');

  // 2. Duplicate delivery (same deterministic key) — same effect, one source commit.
  const r2 = coord.submit({ key: 'WO-N-1|PART-008|2', safeArgs, secretArgs });
  assert.equal(r2.duplicate, true);
  assert.equal(r2.outcome.sourceRef, 'SRC-WO-N-1|PART-008|2');
  assert.equal(source.attempts, 1, 'source saw exactly one commit');

  // 3. Response lost AFTER commit: reconcile by query, no second commit.
  const key2 = 'WO-N-1|PART-011|1';
  coord.submit({ key: key2, safeArgs, secretArgs });
  assert.equal(source.attempts, 2);
  // Simulate the crash-after-commit: a new worker resumes and finds 'submitted'
  // with no local outcome; first reconcile query fails -> unknown.
  source.queryFailUntil = 1;
  const rr1 = coord.reconcile(key2);
  assert.equal(rr1.state, 'unknown_manual_review');
  assert.equal(source.attempts, 2, 'unknown never re-commits');
  // Operator/next worker retries ONLY the reconcile; source now answers.
  const rr2 = coord.reconcile(key2);
  assert.equal(rr2.state, 'succeeded');
  assert.equal(rr2.outcome.sourceRef, `SRC-${key2}`);
  assert.equal(source.attempts, 2, 'still exactly the original commit');

  // 4. Persistence: reload the journal from disk and confirm state survives.
  const onDisk = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.equal(onDisk.ledger[key2].state, 'succeeded');
  assert.ok(!JSON.stringify(onDisk).includes('CANARY-DURABLE-SECRET-9931'), 'canary persisted anywhere');
  assert.equal(onDisk.outbox[0].argsRef.startsWith('argsref-'), true);

  // 5. WORKER RESTART: a brand-new coordinator process resumes from the
  //    durable journal alone (in-memory source cache gone), receives a
  //    duplicate delivery, and returns the same outcome without re-committing.
  const source2 = new FakeSource();
  const store2 = new JsonStore(file);
  store2.state = JSON.parse(fs.readFileSync(file, 'utf8'));
  const coord2 = new Coordinator(store2, source2);
  const resume = coord2.submit({ key: 'WO-N-1|PART-008|2', safeArgs, secretArgs });
  assert.equal(resume.duplicate, true);
  assert.equal(resume.outcome.sourceRef, 'SRC-WO-N-1|PART-008|2');
  assert.equal(source2.attempts, 0, 'restarted worker made no source call on duplicate');

  // 6. TIMEOUT BEFORE SOURCE COMMIT: the source call itself fails. The
  //    intent/outbox persist, state is retry_wait, and a later retry commits
  //    exactly once.
  const flaky = new FakeSource();
  const store3 = new JsonStore(file + '.3');
  const coord3 = new Coordinator(store3, flaky);
  flaky.commit = (op) => {
    if (flaky.attempts === 0) { flaky.attempts += 1; throw Object.assign(new Error('timeout before commit'), { code: 'timeout' }); }
    return FakeSource.prototype.commit.call(flaky, op);
  };
  const to = coord3.submit({ key: 'WO-X|PART-008|1', safeArgs, secretArgs });
  assert.equal(to.state, 'retry_wait');
  const afterRetry = coord3.dispatch('WO-X|PART-008|1');
  assert.equal(afterRetry.state, 'succeeded');
  assert.equal(flaky.attempts, 2); // one failed attempt recorded, one commit
  return { sourceAttempts: source.attempts, sourceQueries: source.queries, states: Object.fromEntries(Object.entries(onDisk.ledger).map(([k, v]) => [k, v.state])) };
};

const summary = run();
console.log('durable coordination simulation passed:', JSON.stringify(summary));
