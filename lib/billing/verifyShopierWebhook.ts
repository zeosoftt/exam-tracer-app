import { createHmac, timingSafeEqual } from 'crypto';

/** Shopier REST webhook imzasını doğrular (HMAC-SHA256, Shopier-Signature header). */
export function verifyShopierWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader || !secret) return false;
  const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
  try {
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(signatureHeader.trim(), 'utf8');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
