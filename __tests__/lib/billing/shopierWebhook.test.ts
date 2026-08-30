import { createHmac } from 'crypto';
import { verifyShopierWebhookSignature } from '@/lib/billing/verifyShopierWebhook';
import { normalizeBillingEmail } from '@/lib/billing/normalizeBillingEmail';
import { PRO_PLAN_PERIOD_DAYS } from '@/config/constants';
import { SHOPIER_WEBHOOK_REASONS } from '@/lib/billing/shopierWebhookReasons';

describe('verifyShopierWebhookSignature', () => {
  const secret = 'test-shopier-secret';
  const body = JSON.stringify({ email: 'user@example.com', orderId: 'ord_1', planCode: 'PRO' });

  function sign(raw: string, key: string): string {
    return createHmac('sha256', key).update(raw, 'utf8').digest('hex');
  }

  it('accepts valid HMAC-SHA256 hex signature', () => {
    const sig = sign(body, secret);
    expect(verifyShopierWebhookSignature(body, sig, secret)).toBe(true);
  });

  it('rejects invalid signature', () => {
    expect(verifyShopierWebhookSignature(body, 'deadbeef', secret)).toBe(false);
  });

  it('rejects missing signature header', () => {
    expect(verifyShopierWebhookSignature(body, null, secret)).toBe(false);
  });

  it('rejects wrong secret', () => {
    const sig = sign(body, secret);
    expect(verifyShopierWebhookSignature(body, sig, 'other-secret')).toBe(false);
  });
});

describe('normalizeBillingEmail', () => {
  it('lowercases and trims', () => {
    expect(normalizeBillingEmail('  User@Example.COM ')).toBe('user@example.com');
  });
});

describe('PRO period alignment', () => {
  it('uses 180 days for 6-month PRO billing period', () => {
    expect(PRO_PLAN_PERIOD_DAYS).toBe(180);
  });
});

describe('Shopier webhook reason codes', () => {
  it('exposes stable failure codes for ops', () => {
    expect(SHOPIER_WEBHOOK_REASONS.INVALID_SIGNATURE).toBe('INVALID_SIGNATURE');
    expect(SHOPIER_WEBHOOK_REASONS.USER_NOT_FOUND).toBe('USER_NOT_FOUND');
    expect(SHOPIER_WEBHOOK_REASONS.DUPLICATE_ORDER).toBe('DUPLICATE_ORDER');
    expect(SHOPIER_WEBHOOK_REASONS.SUCCESS).toBe('SUCCESS');
  });
});
