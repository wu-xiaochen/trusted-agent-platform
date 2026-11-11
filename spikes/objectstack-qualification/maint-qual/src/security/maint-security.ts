// Copyright (c) 2026 TP-02 qualification spike. Synthetic data only.
//
// Two business positions with deliberately DISJOINT grants (TP-02 Task 3):
//   maint_planner    reads north-region work orders incl. internal cost;
//                    cannot read spare parts; cannot invoke the action.
//   maint_technician reads only work orders assigned to them (cost masked),
//                    reads spare parts (unit cost masked), and alone holds the
//                    maint.request_spare capability the action requires.
// Neither position has create/edit/delete on ANY business object. Writes exist
// only behind the named action, whose handler runs server-side elevated.

import { defineCapability } from '@objectstack/spec';
import { definePosition } from '@objectstack/spec/identity';
import { definePermissionSet } from '@objectstack/spec/security';

export const RequestSpareCapability = defineCapability({
  name: 'maint.request_spare',
  label: 'Request spare part against a work order',
  description: 'Invoke the named request-spare business action.',
  scope: 'org',
});

export const PlannerPosition = definePosition({
  name: 'maint_planner',
  label: 'Maintenance Planner',
  permissionSets: ['maint_planner_access'],
});

export const TechnicianPosition = definePosition({
  name: 'maint_technician',
  label: 'Maintenance Technician',
  permissionSets: ['maint_technician_access'],
});

export const PlannerAccess = definePermissionSet({
  name: 'maint_planner_access',
  label: 'Planner access (north work orders)',
  objects: {
    // readScope 'org' opens the OWD-private depth to org-wide; the RLS policy
    // below then NARROWS it to north-region rows (RLS never widens).
    maint_qual_work_order: { allowRead: true, readScope: 'org' },
  },
  fields: {
    // Explicit positive grant: planners are the one role that sees cost.
    'maint_qual_work_order.internal_cost': { readable: true, editable: false },
  },
  rowLevelSecurity: [
    {
      name: 'planner_north_work_orders',
      label: 'North region work orders only',
      object: 'maint_qual_work_order',
      operation: 'select',
      using: "region == 'north'",
      positions: ['maint_planner'],
      enabled: true,
    },
  ],
});

export const TechnicianAccess = definePermissionSet({
  name: 'maint_technician_access',
  label: 'Technician access (assigned work orders)',
  objects: {
    // readScope 'org' lets RLS below narrow to the caller-assigned rows.
    maint_qual_work_order: { allowRead: true, readScope: 'org' },
    // maint_qual_spare_part is federated at runtime; its read grant is added
    // through the environment metadata door (runtime permission set), because
    // package metadata cannot reference a runtime object at validate time.
  },
  fields: {
    // Block-list FLS posture: cost is explicitly withheld from this set (no
    // other set this user holds may re-grant it). The federated unit_cost
    // masking lives in the runtime grant (see provision-datasource.mjs).
    'maint_qual_work_order.internal_cost': { readable: false, editable: false },
  },
  systemPermissions: ['maint.request_spare'],
  rowLevelSecurity: [
    {
      name: 'technician_assigned_work_orders',
      label: 'Work orders assigned to the signed-in technician',
      object: 'maint_qual_work_order',
      operation: 'select',
      using: 'assignee_email == current_user.email',
      positions: ['maint_technician'],
      enabled: true,
    },
  ],
});
