// Copyright (c) 2026 TP-02 qualification spike. Synthetic data only.
//
// Effect records produced exclusively by the named action
// `maint_qual_request_spare` (its registered handler runs under the server's
// elevated system context). No business permission set grants create/edit/
// delete on this object: a direct POST/PATCH/DELETE through REST, client SDK
// or MCP must be refused. That is the TP-02 G6 "generic write containment"
// probe target.

import { ObjectSchema, Field } from '@objectstack/spec/data';

export const SpareRequest = ObjectSchema.create({
  name: 'maint_qual_spare_request',
  label: 'Spare Request',
  pluralLabel: 'Spare Requests',
  description: 'Effect record of the named request-spare action; not directly writable by users.',

  fieldGroups: [{ key: 'details', label: 'Details' }],

  fields: {
    code: Field.text({ label: 'Request No.', required: true, searchable: true, maxLength: 40, group: 'details' }),
    work_order_code: Field.text({ label: 'Work Order No.', required: true, maxLength: 32, group: 'details' }),
    part_no: Field.text({ label: 'Part No.', required: true, maxLength: 32, group: 'details' }),
    quantity: Field.number({ label: 'Quantity', required: true, precision: 9, scale: 0, group: 'details' }),
    requester_email: Field.text({ label: 'Requester Email', required: true, group: 'details' }),
    status: Field.select({
      label: 'Status',
      required: true,
      group: 'details',
      options: [{ label: 'Requested', value: 'requested', color: '#3B82F6', default: true }],
    }),
  },

  sharingModel: 'private',
  enable: { apiEnabled: true, searchable: true },
});
