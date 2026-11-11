// Copyright (c) 2026 TP-02 qualification spike. Synthetic data only.
import { defineStack } from '@objectstack/spec';
import { ConnectorRestPlugin } from '@objectstack/connector-rest';
import { ConnectorOpenApiPlugin } from '@objectstack/connector-openapi';
import { ConnectorMcpPlugin } from '@objectstack/connector-mcp';
import * as objects from './src/objects';
import * as views from './src/views';
import * as actions from './src/actions';
import * as apps from './src/apps';
import * as security from './src/security';

const exportsOf = <M extends object>(barrel: M): M[keyof M][] => Object.values(barrel);

export default defineStack({
  manifest: {
    id: 'dev.tp02.maint-qual',
    namespace: 'maint_qual',
    version: '0.1.0',
    type: 'app',
    name: 'TP-02 Maintenance Qualification',
    engines: { protocol: '^18' },
  },

  requires: ['automation', 'triggers'],

  plugins: [
    new ConnectorRestPlugin(),
    new ConnectorOpenApiPlugin(),
    new ConnectorMcpPlugin(),
  ],

  // The external inventory datasource and the federated spare-part object
  // are provisioned at runtime via the datasource admin door (environment
  // config holds the source credential), then bound by native id from the
  // task extension. See scripts/provision-datasource.mjs.

  objects: exportsOf(objects),
  views: exportsOf(views),
  actions: [actions.RequestSpareAction],
  apps: exportsOf(apps),
  capabilities: [security.RequestSpareCapability],
  positions: [security.PlannerPosition, security.TechnicianPosition],
  permissions: [security.PlannerAccess, security.TechnicianAccess],
});

// Registers the named-action server handler. This named export is merged onto
// the stack as the `onEnable` lifecycle key (see blank template comment).
export const onEnable = (ctx: {
  ql: {
    registerAction(objectName: string, actionName: string, handler: (ctx: unknown) => unknown): void;
  };
}): void => {
  ctx.ql.registerAction(
    'maint_qual_work_order',
    'requestSpare',
    actions.requestSpare as (ctx: unknown) => unknown,
  );
};
