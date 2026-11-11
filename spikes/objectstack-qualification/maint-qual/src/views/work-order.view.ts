// Copyright (c) 2026 TP-02 qualification spike. Synthetic data only.

import { defineView } from '@objectstack/spec';

const workOrderData = { provider: 'object' as const, object: 'maint_qual_work_order' };

export const WorkOrderViews = defineView({
  list: {
    label: 'All Work Orders',
    type: 'grid',
    data: workOrderData,
    columns: [
      { field: 'code' },
      { field: 'title' },
      { field: 'status' },
      { field: 'region' },
      { field: 'assignee_email' },
    ],
    rowActions: ['maint_request_spare'],
  },
  form: {
    type: 'simple',
    data: workOrderData,
    sections: [
      {
        name: 'work_order',
        label: 'Work Order',
        columns: 2,
        fields: ['code', 'title', 'status', 'region', 'assignee_email', 'internal_cost'],
      },
    ],
  },
});
