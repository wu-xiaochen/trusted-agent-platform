// Copyright (c) 2026 TP-02 qualification spike. Synthetic data only.
//
// A work order as represented on the PLATFORM side. The authoritative record
// lives in the external EAM source (see datasources/inventory-source.ts);
// business users must never mutate this representation through generic CRUD —
// only the named `maint_qual_request_spare` action boundary may write its
// effect records. That containment is the TP-02 G6 gate under test.

import { ObjectSchema, Field } from '@objectstack/spec/data';

export const WorkOrder = ObjectSchema.create({
  name: 'maint_qual_work_order',
  label: 'Work Order',
  pluralLabel: 'Work Orders',
  description: 'Synthetic maintenance work order (qualification spike, read-only to business roles).',

  fieldGroups: [{ key: 'details', label: 'Details' }],

  fields: {
    code: Field.text({
      label: 'Work Order No.',
      required: true,
      searchable: true,
      maxLength: 32,
      group: 'details',
    }),
    title: Field.text({ label: 'Title', required: true, maxLength: 200, group: 'details' }),
    status: Field.select({
      label: 'Status',
      required: true,
      group: 'details',
      options: [
        { label: 'Open', value: 'open', color: '#3B82F6', default: true },
        { label: 'In Progress', value: 'in_progress', color: '#F59E0B' },
        { label: 'Blocked', value: 'blocked', color: '#EF4444' },
        { label: 'Done', value: 'done', color: '#10B981' },
      ],
    }),
    region: Field.select({
      label: 'Region',
      required: true,
      group: 'details',
      options: [
        { label: 'North', value: 'north' },
        { label: 'South', value: 'south' },
      ],
    }),
    assignee_email: Field.text({ label: 'Assignee Email', group: 'details' }),
    // Sensitive business value: planner-visible, masked for technicians (FLS).
    internal_cost: Field.number({ label: 'Internal Cost', precision: 12, scale: 2, group: 'details' }),
    source_ref: Field.text({ label: 'Source Reference', group: 'details' }),
    source_version: Field.text({ label: 'Source Version (precondition)', group: 'details' }),
  },

  // Authored fail-closed OWD — the security publish gate requires this.
  sharingModel: 'private',
  enable: { apiEnabled: true, searchable: true },
});
