// Copyright (c) 2026 TP-02 qualification spike. Synthetic data only.

import { defineAction } from '@objectstack/spec/ui';

/**
 * The ONE named business action of the spike. It is the only way a business
 * role produces a spare-request effect: generic CRUD on the effect object is
 * denied to them (G6). Invocation requires the maint.request_spare capability
 * on BOTH surfaces — REST /api/v1/actions and the MCP run_action tool.
 */
export const RequestSpareAction = defineAction({
  name: 'maint_request_spare',
  label: 'Request Spare Part',
  objectName: 'maint_qual_work_order',
  icon: 'package-plus',
  type: 'script',
  target: 'requestSpare',
  locations: ['record_header'],
  description:
    'Request this spare part for the work order. The request is recorded as a server-resolved effect after you confirm the part number and quantity.',
  params: [
    { name: 'part_no', label: 'Part No.', type: 'text', required: true },
    { name: 'quantity', label: 'Quantity', type: 'number', required: true },
  ],
  requiredPermissions: ['maint.request_spare'],
  visible: "has(record.status) && record.status != 'done'",
  successMessage: 'Spare request recorded.',
  refreshAfter: true,
  ai: {
    exposed: true,
    description:
      'Record a spare-part request against an assigned maintenance work order after the user confirms the part number and quantity.',
  },
});
