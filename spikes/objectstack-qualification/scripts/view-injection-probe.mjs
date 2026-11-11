#!/usr/bin/env node
// TP-02 controlled-view injection probes (G12).
// Exercises the PUBLISHED @objectstack/spec metadata validators with hostile
// declarations: unknown view type, an action of an arbitrary type / missing
// binding, and a literal '*' wildcard grant outside the platform admin set.
// Native validators must reject every one at authoring time.
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(here, '../maint-qual');
// Resolve the framework packages from the scaffolded app's node_modules.
const spec = await import(pathToFileURL(`${appDir}/node_modules/@objectstack/spec/dist/index.js`));
const specUi = await import(pathToFileURL(`${appDir}/node_modules/@objectstack/spec/dist/ui/index.js`));
const { defineView, definePermissionSet } = spec;
const { defineAction } = specUi;
void createRequire;

const results = [];
const expectReject = (name, fn) => {
  try {
    fn();
    results.push({ name, rejected: false });
  } catch (err) {
    results.push({ name, rejected: true, issues: JSON.stringify(err.issues ?? err.message).slice(0, 220) });
  }
};

expectReject('unknown view type', () =>
  defineView({ list: { type: 'run-arbitrary-code', data: { provider: 'object', object: 'x' } } }));

expectReject('action arbitrary type', () =>
  defineAction({ name: 'evil', objectName: 'maint_qual_work_order', type: 'eval-js', target: 'x' }));

expectReject('action missing objectName', () =>
  defineAction({ name: 'evil2', type: 'script', target: 'x' }));

// 4. The spec's permission record accepts string keys, but defineStack's
//    cross-reference validation is the published gate: a literal '*' wildcard
//    outside the platform admin set must be refused at authoring time.
expectReject('wildcard object grant rejected by stack cross-ref validation', () =>
  spec.defineStack({
    manifest: { id: 'dev.tp02.evil', namespace: 'evil', version: '0.1.0', type: 'app', engines: { protocol: '^18' } },
    permissions: [
      definePermissionSet({
        name: 'evil_set',
        objects: { '*': { allowRead: true, allowCreate: true, allowEdit: true, allowDelete: true } },
      }),
    ],
  }),
);

let failed = 0;
for (const r of results) {
  console.log(`${r.rejected ? 'REJECTED  ' : 'ACCEPTED! '} ${r.name}${r.rejected ? '' : ' <<< SECURITY REGRESSION'}`);
  if (r.rejected) console.log('          ', r.issues);
  if (!r.rejected) failed += 1;
}
process.exit(failed ? 1 : 0);
