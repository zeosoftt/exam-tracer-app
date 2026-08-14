/**
 * POST /api/analytics/event — first-party pazarlama olay sayacı (GTM yedek).
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { HTTP_STATUS, RATE_LIMIT } from '@/config/constants';
import { MARKETING_EVENTS } from '@/lib/marketing/marketingEventTypes';
import { incrementMarketingEvent } from '@/lib/marketing/marketingMetricsStore';

const limiter = rateLimit(180, RATE_LIMIT.WINDOW_MS);

const bodySchema = z.object({
  event: z.enum(MARKETING_EVENTS),
  touchpoint: z.string().max(64).optional(),
  step: z.number().int().min(1).max(20).optional(),
  exam_code: z.string().max(32).optional(),
});

export async function POST(req: NextRequest) {
  const limited = limiter(req);
  if (limited) return limited;

  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ success: false }, { status: HTTP_STATUS.BAD_REQUEST });
    }

    await incrementMarketingEvent(parsed.data.event, parsed.data.touchpoint);
    return NextResponse.json({ success: true }, { status: HTTP_STATUS.OK });
  } catch (e) {
    console.error('analytics/event:', e);
    return NextResponse.json({ success: false }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}
