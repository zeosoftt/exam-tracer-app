/**
 * POST /api/billing/shopier/webhook
 * Shopier REST webhook → adapter → existing activation.
 *
 * Signature: Shopier-Signature = HMAC-SHA256(rawBody, SHOPIER_WEBHOOK_SECRET) hex
 * Event: Shopier-Event = order.created
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { HTTP_STATUS, RATE_LIMIT, SHOPIER_CHECKOUT_URL } from '@/config/constants';
import { asyncHandler } from '@/lib/errors/errorHandler';
import { activatePlanByEmail } from '@/lib/billing/activateOrganizationPlan';
import { recordShopierPurchaseActivation } from '@/lib/marketing/marketingMetricsStore';
import { verifyShopierWebhookSignature } from '@/lib/billing/verifyShopierWebhook';
import { SHOPIER_WEBHOOK_REASONS } from '@/lib/billing/shopierWebhookReasons';
import {
  getConfiguredShopierProProductIds,
  mapShopierOrderCreatedToPurchaseEvent,
} from '@/lib/billing/shopier';
import { logApi, logError } from '@/lib/logger';
import { AppError } from '@/lib/errors/AppError';

const limiter = rateLimit(30, RATE_LIMIT.WINDOW_MS);

function readShopierSignature(req: NextRequest): string | null {
  return req.headers.get('shopier-signature') ?? req.headers.get('Shopier-Signature');
}

function readShopierEvent(req: NextRequest): string | null {
  return req.headers.get('shopier-event') ?? req.headers.get('Shopier-Event');
}

async function shopierWebhookHandler(req: NextRequest): Promise<NextResponse> {
  const limited = limiter(req);
  if (limited) return limited;

  const secret = process.env.SHOPIER_WEBHOOK_SECRET?.trim();
  if (!secret) {
    logError('Shopier webhook rejected', new Error(SHOPIER_WEBHOOK_REASONS.MISSING_WEBHOOK_SECRET), {
      reason: SHOPIER_WEBHOOK_REASONS.MISSING_WEBHOOK_SECRET,
      configured: false,
    });
    throw new AppError(
      'Webhook secret not configured',
      HTTP_STATUS.UNAUTHORIZED,
      true,
      SHOPIER_WEBHOOK_REASONS.MISSING_WEBHOOK_SECRET,
    );
  }

  const rawBody = await req.text();
  const signature = readShopierSignature(req);
  if (!verifyShopierWebhookSignature(rawBody, signature, secret)) {
    logError('Shopier webhook rejected', new Error(SHOPIER_WEBHOOK_REASONS.INVALID_SIGNATURE), {
      reason: SHOPIER_WEBHOOK_REASONS.INVALID_SIGNATURE,
      hasSignatureHeader: Boolean(signature),
    });
    throw new AppError(
      'Invalid webhook signature',
      HTTP_STATUS.UNAUTHORIZED,
      true,
      SHOPIER_WEBHOOK_REASONS.INVALID_SIGNATURE,
    );
  }

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    throw new AppError(
      'Invalid JSON body',
      HTTP_STATUS.BAD_REQUEST,
      true,
      SHOPIER_WEBHOOK_REASONS.INVALID_PAYLOAD,
    );
  }

  const allowedProductIds = getConfiguredShopierProProductIds(
    SHOPIER_CHECKOUT_URL,
    process.env.SHOPIER_PRO_PRODUCT_ID,
    process.env.SHOPIER_CHECKOUT_URL,
  );

  const mapped = mapShopierOrderCreatedToPurchaseEvent(
    readShopierEvent(req),
    json,
    allowedProductIds,
  );

  if (!mapped.ok) {
    if (
      mapped.reason === SHOPIER_WEBHOOK_REASONS.IGNORED_EVENT ||
      mapped.reason === SHOPIER_WEBHOOK_REASONS.IGNORED_STATUS
    ) {
      logApi('POST', '/api/billing/shopier/webhook', HTTP_STATUS.OK, undefined, {
        reason: mapped.reason,
      });
      return NextResponse.json({
        success: true,
        message: mapped.message,
        reason: mapped.reason,
      });
    }

    logError('Shopier webhook rejected', new Error(mapped.reason), {
      reason: mapped.reason,
    });
    const status =
      mapped.reason === SHOPIER_WEBHOOK_REASONS.PLAN_NOT_FOUND
        ? HTTP_STATUS.UNPROCESSABLE_ENTITY
        : mapped.reason === SHOPIER_WEBHOOK_REASONS.MISSING_EMAIL
          ? HTTP_STATUS.UNPROCESSABLE_ENTITY
          : HTTP_STATUS.UNPROCESSABLE_ENTITY;
    throw new AppError(mapped.message, status, true, mapped.reason);
  }

  const { purchase } = mapped;
  let result: { userId: string; organizationId: string; idempotent: boolean };
  try {
    result = await activatePlanByEmail(purchase.email, purchase.planCode, purchase.orderId);
  } catch (err) {
    if (err instanceof AppError) {
      logError('Shopier webhook activation failed', err, {
        reason: err.code ?? SHOPIER_WEBHOOK_REASONS.ACTIVATION_FAILED,
        planCode: purchase.planCode,
        hasOrderId: true,
      });
      throw err;
    }
    logError('Shopier webhook activation failed', err as Error, {
      reason: SHOPIER_WEBHOOK_REASONS.ACTIVATION_FAILED,
      planCode: purchase.planCode,
      hasOrderId: true,
    });
    throw new AppError(
      'Plan activation failed',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      true,
      SHOPIER_WEBHOOK_REASONS.ACTIVATION_FAILED,
    );
  }

  const reason = result.idempotent
    ? SHOPIER_WEBHOOK_REASONS.DUPLICATE_ORDER
    : SHOPIER_WEBHOOK_REASONS.SUCCESS;

  if (!result.idempotent) {
    await recordShopierPurchaseActivation();
  }

  logApi('POST', '/api/billing/shopier/webhook', HTTP_STATUS.OK, undefined, {
    reason,
    userId: result.userId,
    organizationId: result.organizationId,
    planCode: purchase.planCode,
    idempotent: result.idempotent,
    hasOrderId: true,
    provider: purchase.provider,
  });

  return NextResponse.json({
    success: true,
    message: result.idempotent ? 'Plan already activated' : 'Plan activated',
    reason,
    data: {
      userId: result.userId,
      planCode: purchase.planCode,
      idempotent: result.idempotent,
    },
  });
}

export const POST = asyncHandler(shopierWebhookHandler);
