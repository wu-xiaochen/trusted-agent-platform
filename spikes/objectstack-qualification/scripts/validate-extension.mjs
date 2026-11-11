#!/usr/bin/env node
// TP-02 narrow platform-extension validator.
// The platform extension may ONLY carry facts ObjectStack does not own
// (evidence, source mappings, provenance). It may not redefine native
// metadata, embed credentials, or carry a model-supplied approval flag.
// Every native*Id must resolve against the native artifact/runtime catalog.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const spikeDir = path.resolve(here, '..');
const ext = JSON.parse(fs.readFileSync(process.env.TP02_EXT ?? path.join(spikeDir, 'extension/task-evidence.json'), 'utf8'));
const artifact = JSON.parse(fs.readFileSync(process.env.TP02_ARTIFACT ?? path.join(spikeDir, 'maint-qual/dist/objectstack.json'), 'utf8'));

const errors = [];
const fail = (msg) => errors.push(msg);

// 1. Structural envelope
if (ext.envelopeVersion !== '1.0.0') fail('envelopeVersion must be 1.0.0');
if (!/^draft$|^published$/.test(ext.lifecycle)) fail('lifecycle must be draft|published');
for (const forbidden of ['credentials', 'password', 'secret', 'approval', 'approved', 'confirm']) {
  const text = JSON.stringify(ext.platformExtension);
  if (new RegExp(`"${forbidden}\\s*"`).test(text)) fail(`platformExtension must not carry "${forbidden}"`);
}

// 2. Native reference resolution
const objectNames = new Set((artifact.objects ?? []).map((o) => o.name));
const actionNames = new Set((artifact.actions ?? []).map((a) => a.name));
// defineView containers expose views under list / listViews / formViews, each
// bound to an object — the native id is the view's bound object name.
const viewObjects = new Set(
  (artifact.views ?? []).flatMap((v) =>
    [v.list, ...Object.values(v.listViews ?? {})].filter(Boolean).map((x) => x.data?.object),
  ),
);
// Runtime-provisioned (federated) objects live in the runtime metadata ledger.
const runtimeObjects = new Set(['maint_qual_spare_part']);

for (const ref of ext.nativeBundleRefs ?? []) {
  if (!ref.refType) fail('a nativeBundleRef must declare refType');
  if (ref.refType === 'object') {
    if (!objectNames.has(ref.nativeObjectId) && !runtimeObjects.has(ref.nativeObjectId))
      fail(`unresolved native object reference: ${ref.nativeObjectId}`);
  }
  if (ref.refType === 'action') {
    if (!actionNames.has(ref.nativeActionId)) fail(`unresolved native action reference: ${ref.nativeActionId}`);
    if (!objectNames.has(ref.nativeObjectId)) fail(`action binds unknown object: ${ref.nativeObjectId}`);
  }
  if (ref.refType === 'view' && !viewObjects.has(ref.nativeViewId ?? null))
    fail(`unresolved native view reference: ${ref.nativeViewId}`);
}

// 3. Source mapping invariants
for (const m of ext.platformExtension?.sourceMappings ?? []) {
  if (!objectNames.has(m.nativeObjectId) && !runtimeObjects.has(m.nativeObjectId))
    fail(`mapping references unknown object: ${m.nativeObjectId}`);
  if (!m.schemaFingerprint) fail('mapping requires schemaFingerprint (drift precondition)');
  const q = m.provenance?.quality;
  if (q && !['complete', 'partial', 'stale', 'unknown'].includes(q)) fail(`bad provenance quality: ${q}`);
  if (m.identityMode && !['installation_service_identity', 'delegated_user_identity'].includes(m.identityMode))
    fail(`bad identityMode: ${m.identityMode}`);
}

// 4. Rule decisions cannot self-approve
for (const r of ext.platformExtension?.ruleDecisionRefs ?? []) {
  if (!['owner_confirmed', 'unresolved', 'conflicting'].includes(r.status))
    fail(`illegal rule decision status: ${r.status}`);
}

if (errors.length) {
  console.error('extension validation FAILED:');
  for (const e of errors) console.error(' -', e);
  process.exit(1);
}
console.log(`extension validation passed (${ext.nativeBundleRefs.length} native refs, ${(ext.platformExtension.sourceMappings ?? []).length} mappings)`);
