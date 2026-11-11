// Copyright (c) 2026 TP-02 qualification spike. Synthetic data only.

import { App } from '@objectstack/spec/ui';

export const MaintApp = App.create({
  name: 'maint_qual_app',
  label: 'Maintenance Qualification',
  icon: 'wrench',
  navigation: [
    {
      id: 'group_maintenance',
      type: 'group',
      label: 'Maintenance',
      icon: 'wrench',
      children: [
        { id: 'nav_work_orders', type: 'object', objectName: 'maint_qual_work_order', label: 'Work Orders', icon: 'clipboard-list' },
      ],
    },
  ],
});
