// Copyright (c) 2026 TP-02 qualification spike. Synthetic data only.

/**
 * Named-action handler. Runs elevated (isSystem) by framework design; the
 * caller-specific checks that elevate away are re-established here:
 *  - recordLoadDenied: the subject work order was not readable in the
 *    CALLER's own scope -> refuse as not-found (TP-02 G6).
 *  - the effect record key is deterministic from (work order, part, qty) so
 *    duplicate deliveries return the same effect instead of creating a
 *    parallel side effect (idempotency probe feeding the durable step).
 *
 * ctx.engine is the published ActionEngineFacade: find(object, envelope),
 * insert/update/delete — TRUSTED and context-less; the runtime stamps its
 * own elevated ExecutionContext last (caller-supplied context is ignored).
 */

type EngineFacade = {
  find(object: string, query: { where?: Record<string, unknown>; limit?: number }): Promise<Array<Record<string, unknown>>>;
  insert(object: string, values: Record<string, unknown>): Promise<{ id: string }>;
};

type ActionContext = {
  recordLoadDenied?: true;
  record?: { id?: string };
  params?: { part_no?: unknown; quantity?: unknown };
  user?: { email?: string };
  engine: EngineFacade;
};

const EFFECT_OBJECT = 'maint_qual_spare_request';
const WORK_ORDER_OBJECT = 'maint_qual_work_order';

export async function requestSpare(ctx: ActionContext): Promise<unknown> {
  if (ctx.recordLoadDenied === true) {
    throw Object.assign(new Error('Work order not available to this caller'), {
      code: 'RECORD_NOT_FOUND',
    });
  }

  const partNo = String(ctx.params?.part_no ?? '').trim().toUpperCase();
  const quantity = Number(ctx.params?.quantity);
  const email = String(ctx.user?.email ?? '');
  if (!partNo || !/^PART-\d+$/.test(partNo)) {
    throw Object.assign(new Error('A valid PART-xxxx part number is required'), { code: 'VALIDATION_FAILED' });
  }
  if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 999) {
    throw Object.assign(new Error('Quantity must be an integer 1..999'), { code: 'VALIDATION_FAILED' });
  }
  if (!email) {
    throw Object.assign(new Error('Action requires a resolved user identity'), { code: 'UNAUTHENTICATED' });
  }

  const workOrders = await ctx.engine.find(WORK_ORDER_OBJECT, {
    where: { id: ctx.record?.id },
    limit: 1,
  });
  const workOrder = workOrders[0];
  if (!workOrder) {
    throw Object.assign(new Error('Work order not found'), { code: 'RECORD_NOT_FOUND' });
  }
  const workOrderCode = String(workOrder.code);
  const effectCode = `SR-${workOrderCode}-${partNo}-${quantity}`;

  // Stable dedupe key: same canonical input returns the existing effect.
  const existing = await ctx.engine.find(EFFECT_OBJECT, { where: { code: effectCode }, limit: 1 });
  if (existing[0]) {
    return { idempotent: true, effect: { id: existing[0].id, code: effectCode } };
  }

  const created = await ctx.engine.insert(EFFECT_OBJECT, {
    code: effectCode,
    work_order_code: workOrderCode,
    part_no: partNo,
    quantity,
    requester_email: email,
    status: 'requested',
  });
  return { idempotent: false, effect: { id: created.id, code: effectCode } };
}
