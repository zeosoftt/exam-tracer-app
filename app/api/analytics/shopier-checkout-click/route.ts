/**
 * POST /api/analytics/shopier-checkout-click
 * Shopier satın alma bağlantısına her tıklamada sayaç artırır (herkese açık, IP rate limit).
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { HTTP_STATUS, RATE_LIMIT } from '@/config/constants';
import { incrementShopierCheckoutClick } from '@/lib/siteSettings';

const limiter = rateLimit(120, RATE_LIMIT.LOGIN_WINDOW_MS);

export async function POST(req: NextRequest) {
  const limited = limiter(req);
  if (limited) return limited;

  try {
    await incrementShopierCheckoutClick();
    return NextResponse.json({ success: true }, { status: HTTP_STATUS.OK });
  } catch (e) {
    console.error('shopier-checkout-click:', e);
    return NextResponse.json({ success: false }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}
