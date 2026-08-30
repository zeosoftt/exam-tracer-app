/**
 * Shopier REST webhook → Internal PurchaseEvent adapter.
 * Official contract: order.created + Order model (developer.shopier.com).
 */

import { z } from 'zod';
import { normalizeBillingEmail } from '@/lib/billing/normalizeBillingEmail';
import { SHOPIER_WEBHOOK_REASONS, type ShopierWebhookReason } from '@/lib/billing/shopierWebhookReasons';
import type { PurchaseEvent } from '@/lib/billing/shopier/purchaseEvent';

export const SHOPIER_ORDER_CREATED_EVENT = 'order.created';

const optionalEmailField = z
  .string()
  .min(1)
  .transform((s) => s.trim())
  .pipe(z.string().email())
  .optional();

const contactEmailSchema = z
  .object({
    email: optionalEmailField,
  })
  .passthrough()
  .optional();

const lineItemSchema = z
  .object({
    productId: z.union([z.string(), z.number()]).optional(),
    title: z.string().optional(),
  })
  .passthrough();

/** Minimal Order model fields we need — extra Shopier fields allowed via passthrough. */
export const shopierOrderCreatedSchema = z
  .object({
    id: z.union([z.string().min(1), z.number()]),
    paymentStatus: z.string().optional(),
    shippingInfo: contactEmailSchema,
    billingInfo: contactEmailSchema,
    lineItems: z.array(lineItemSchema).optional(),
  })
  .passthrough();

export type ShopierOrderCreatedPayload = z.infer<typeof shopierOrderCreatedSchema>;

export type ShopierAdapterResult =
  | { ok: true; purchase: PurchaseEvent }
  | { ok: false; reason: ShopierWebhookReason; message: string };

function asProductIdString(value: string | number | undefined): string | null {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s.length > 0 ? s : null;
}

function resolveBuyerEmail(order: ShopierOrderCreatedPayload): string | null {
  const shipping = order.shippingInfo?.email?.trim();
  if (shipping) return normalizeBillingEmail(shipping);
  const billing = order.billingInfo?.email?.trim();
  if (billing) return normalizeBillingEmail(billing);
  return null;
}

function resolvePlanCode(
  order: ShopierOrderCreatedPayload,
  allowedProProductIds: readonly string[],
): 'PRO' | null {
  if (allowedProProductIds.length === 0) return null;
  const allowed = new Set(allowedProProductIds.map(String));
  for (const item of order.lineItems ?? []) {
    const productId = asProductIdString(item.productId);
    if (productId && allowed.has(productId)) return 'PRO';
  }
  return null;
}

/**
 * Maps a verified Shopier REST webhook into an internal PurchaseEvent.
 * Does not activate plans or touch the database.
 */
export function mapShopierOrderCreatedToPurchaseEvent(
  eventType: string | null,
  json: unknown,
  allowedProProductIds: readonly string[],
): ShopierAdapterResult {
  if (!eventType || eventType.trim() !== SHOPIER_ORDER_CREATED_EVENT) {
    return {
      ok: false,
      reason: SHOPIER_WEBHOOK_REASONS.IGNORED_EVENT,
      message: `Ignored Shopier event: ${eventType ?? 'missing'}`,
    };
  }

  const parsed = shopierOrderCreatedSchema.safeParse(json);
  if (!parsed.success) {
    return {
      ok: false,
      reason: SHOPIER_WEBHOOK_REASONS.INVALID_PAYLOAD,
      message: 'Invalid Shopier order payload',
    };
  }

  const order = parsed.data;
  const orderId = String(order.id).trim();
  if (!orderId) {
    return {
      ok: false,
      reason: SHOPIER_WEBHOOK_REASONS.INVALID_PAYLOAD,
      message: 'Missing order id',
    };
  }

  if (order.paymentStatus && order.paymentStatus !== 'paid') {
    return {
      ok: false,
      reason: SHOPIER_WEBHOOK_REASONS.IGNORED_STATUS,
      message: `Ignored paymentStatus: ${order.paymentStatus}`,
    };
  }

  const email = resolveBuyerEmail(order);
  if (!email) {
    return {
      ok: false,
      reason: SHOPIER_WEBHOOK_REASONS.MISSING_EMAIL,
      message: 'No shippingInfo.email or billingInfo.email',
    };
  }

  const planCode = resolvePlanCode(order, allowedProProductIds);
  if (!planCode) {
    return {
      ok: false,
      reason: SHOPIER_WEBHOOK_REASONS.PLAN_NOT_FOUND,
      message: 'No lineItems.productId matched configured PRO product',
    };
  }

  return {
    ok: true,
    purchase: {
      provider: 'shopier',
      orderId,
      email,
      planCode,
    },
  };
}
