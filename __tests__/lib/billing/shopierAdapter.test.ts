import {
  extractProductIdFromShopierCheckoutUrl,
  getConfiguredShopierProProductIds,
} from '@/lib/billing/shopier/productMapping';
import {
  SHOPIER_ORDER_CREATED_EVENT,
  mapShopierOrderCreatedToPurchaseEvent,
} from '@/lib/billing/shopier/mapShopierOrderCreated';
import { SHOPIER_WEBHOOK_REASONS } from '@/lib/billing/shopierWebhookReasons';
import { verifyShopierWebhookSignature } from '@/lib/billing/verifyShopierWebhook';
import { createHmac } from 'crypto';

const PRO_PRODUCT_ID = '47039117';

function validOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: 'test-order-001',
    paymentStatus: 'paid',
    shippingInfo: { email: 'test@example.com' },
    billingInfo: {},
    lineItems: [{ productId: PRO_PRODUCT_ID, title: 'TheGoallabs PRO' }],
    ...overrides,
  };
}

describe('extractProductIdFromShopierCheckoutUrl', () => {
  it('extracts trailing numeric product id', () => {
    expect(
      extractProductIdFromShopierCheckoutUrl('https://www.shopier.com/zeosoft/47039117'),
    ).toBe('47039117');
  });
});

describe('getConfiguredShopierProProductIds', () => {
  it('includes id from checkout URL and env', () => {
    const ids = getConfiguredShopierProProductIds(
      'https://www.shopier.com/zeosoft/47039117',
      '999',
      null,
    );
    expect(ids).toEqual(expect.arrayContaining(['47039117', '999']));
  });
});

describe('mapShopierOrderCreatedToPurchaseEvent', () => {
  const allowed = [PRO_PRODUCT_ID];

  it('maps valid order.created to PurchaseEvent', () => {
    const result = mapShopierOrderCreatedToPurchaseEvent(
      SHOPIER_ORDER_CREATED_EVENT,
      validOrder(),
      allowed,
    );
    expect(result).toEqual({
      ok: true,
      purchase: {
        provider: 'shopier',
        orderId: 'test-order-001',
        email: 'test@example.com',
        planCode: 'PRO',
      },
    });
  });

  it('uses billing email when shipping email missing', () => {
    const result = mapShopierOrderCreatedToPurchaseEvent(
      SHOPIER_ORDER_CREATED_EVENT,
      validOrder({
        shippingInfo: {},
        billingInfo: { email: '  Billing@Example.COM ' },
      }),
      allowed,
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.purchase.email).toBe('billing@example.com');
    }
  });

  it('returns MISSING_EMAIL when both emails absent', () => {
    const result = mapShopierOrderCreatedToPurchaseEvent(
      SHOPIER_ORDER_CREATED_EVENT,
      validOrder({ shippingInfo: {}, billingInfo: {} }),
      allowed,
    );
    expect(result).toMatchObject({ ok: false, reason: SHOPIER_WEBHOOK_REASONS.MISSING_EMAIL });
  });

  it('ignores unknown event types', () => {
    const result = mapShopierOrderCreatedToPurchaseEvent(
      'refund.updated',
      validOrder(),
      allowed,
    );
    expect(result).toMatchObject({ ok: false, reason: SHOPIER_WEBHOOK_REASONS.IGNORED_EVENT });
  });

  it('ignores unpaid paymentStatus', () => {
    const result = mapShopierOrderCreatedToPurchaseEvent(
      SHOPIER_ORDER_CREATED_EVENT,
      validOrder({ paymentStatus: 'unpaid' }),
      allowed,
    );
    expect(result).toMatchObject({ ok: false, reason: SHOPIER_WEBHOOK_REASONS.IGNORED_STATUS });
  });

  it('returns PLAN_NOT_FOUND for unknown product', () => {
    const result = mapShopierOrderCreatedToPurchaseEvent(
      SHOPIER_ORDER_CREATED_EVENT,
      validOrder({
        lineItems: [{ productId: '00000000', title: 'Other' }],
      }),
      allowed,
    );
    expect(result).toMatchObject({ ok: false, reason: SHOPIER_WEBHOOK_REASONS.PLAN_NOT_FOUND });
  });

  it('returns INVALID_PAYLOAD for missing order id', () => {
    const result = mapShopierOrderCreatedToPurchaseEvent(
      SHOPIER_ORDER_CREATED_EVENT,
      { paymentStatus: 'paid', shippingInfo: { email: 'a@b.com' }, lineItems: [] },
      allowed,
    );
    expect(result).toMatchObject({ ok: false, reason: SHOPIER_WEBHOOK_REASONS.INVALID_PAYLOAD });
  });

  it('returns INVALID_PAYLOAD for malformed structure', () => {
    const result = mapShopierOrderCreatedToPurchaseEvent(
      SHOPIER_ORDER_CREATED_EVENT,
      { id: 'x', shippingInfo: { email: 'not-an-email' } },
      allowed,
    );
    expect(result).toMatchObject({ ok: false, reason: SHOPIER_WEBHOOK_REASONS.INVALID_PAYLOAD });
  });
});

describe('Shopier-Signature verification (raw body)', () => {
  const secret = 'test-shopier-secret';
  const body = JSON.stringify(validOrder());

  it('accepts valid HMAC over raw body', () => {
    const sig = createHmac('sha256', secret).update(body, 'utf8').digest('hex');
    expect(verifyShopierWebhookSignature(body, sig, secret)).toBe(true);
  });

  it('rejects invalid signature', () => {
    expect(verifyShopierWebhookSignature(body, 'deadbeef', secret)).toBe(false);
  });
});
