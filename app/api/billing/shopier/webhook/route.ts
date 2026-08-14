/**
 * POST /api/billing/shopier/webhook
 * Shopier ödeme tamamlandığında planı aktive eder.
 * Header: x-shopier-signature = HMAC-SHA256(rawBody, SHOPIER_WEBHOOK_SECRET)
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { RATE_LIMIT, HTTP_STATUS } from '@/config/constants';
import { asyncHandler } from '@/lib/errors/errorHandler';
import { validate } from '@/lib/validation/validate';
import { activatePlanByEmail } from '@/lib/billing/activateOrganizationPlan';
import { incrementPurchaseCount } from '@/lib/marketing/marketingMetricsStore';
import { verifyShopierWebhookSignature } from '@/lib/billing/verifyShopierWebhook';
import { logApi, logError } from '@/lib/logger';
import { UnauthorizedError, BadRequestError } from '@/lib/errors/AppError';

const limiter = rateLimit(30, RATE_LIMIT.WINDOW_MS);

const shopierWebhookSchema = z.object({
  email: z.string().email(),
  planCode: z.string().min(2).max(32).optional().default('PRO'),
  orderId: z.string().min(1).max(128),
  status: z.enum(['completed', 'paid', 'success']).optional(),
});

async function shopierWebhookHandler(req: NextRequest): Promise<NextResponse> {
  const limited = limiter(req);
  if (limited) return limited;

  const secret = process.env.SHOPIER_WEBHOOK_SECRET?.trim();
  if (!secret) {
    logError('Shopier webhook: SHOPIER_WEBHOOK_SECRET not configured');
    throw new UnauthorizedError();
  }

  const rawBody = await req.text();
  const signature = req.headers.get('x-shopier-signature');
  if (!verifyShopierWebhookSignature(rawBody, signature, secret)) {
    throw new UnauthorizedError();
  }

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    throw new BadRequestError('Invalid JSON body');
  }

  const payload = validate(shopierWebhookSchema, json);
  if (payload.status && !['completed', 'paid', 'success'].includes(payload.status)) {
    return NextResponse.json({ success: true, message: 'Ignored non-success status' });
  }

  const planCode = payload.planCode ?? 'PRO';
  const result = await activatePlanByEmail(payload.email, planCode, payload.orderId);
  if (!result.idempotent) {
    await incrementPurchaseCount();
  }

  logApi('POST', '/api/billing/shopier/webhook', HTTP_STATUS.OK, undefined, {
    userId: result.userId,
    orderId: payload.orderId,
  });

  return NextResponse.json({
    success: true,
    message: result.idempotent ? 'Plan already activated' : 'Plan activated',
    data: {
      userId: result.userId,
      planCode: planCode.toUpperCase(),
      idempotent: result.idempotent,
    },
  });
}

export const POST = asyncHandler(shopierWebhookHandler);
