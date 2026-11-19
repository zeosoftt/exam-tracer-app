import { createHmac, timingSafeEqual } from 'crypto';

const HMAC_BYTES = 32;

/**
 * Shopier-Signature header değerini ham HMAC baytlarına çevirir.
 * Shopier dokümanı "HS256 (HMAC with SHA-256)" der ama kodlamayı belirtmez;
 * hex, base64 ve base64url kabul edilir.
 */
function decodeSignature(header: string): Buffer | null {
  const value = header.trim();
  if (/^[0-9a-f]{64}$/i.test(value)) {
    return Buffer.from(value, 'hex');
  }
  if (/^[A-Za-z0-9+/_-]+=*$/.test(value)) {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const buf = Buffer.from(normalized, 'base64');
    if (buf.length === HMAC_BYTES) return buf;
  }
  return null;
}

/** Shopier REST webhook imzasını doğrular (HMAC-SHA256, Shopier-Signature header). */
export function verifyShopierWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader || !secret) return false;
  try {
    const provided = decodeSignature(signatureHeader);
    if (!provided) return false;
    const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest();
    if (provided.length !== expected.length) return false;
    return timingSafeEqual(provided, expected);
  } catch {
    return false;
  }
}
