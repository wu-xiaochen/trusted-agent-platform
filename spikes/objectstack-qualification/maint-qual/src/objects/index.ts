export { WorkOrder } from './work-order.object.js';
export { SpareRequest } from './spare-request.object.js';
// maint_qual_spare_part is federated at RUNTIME through the datasource admin
// door (scripts/provision-datasource.mjs): an external source binding with a
// secret is environment config, not package metadata — see DOMAIN-PACKAGE.md
// platformExtension.sourceMappings.
