/**
 * POST /api/analytics/session — uygulamada kalma süresi (first-party).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { authOptions } from '@/lib/auth/config';
import { HTTP_STATUS, RATE_LIMIT } from '@/config/constants';
import { recordAppSession } from '@/lib/marketing/recordAppSession';

const limiter = rateLimit(120, RATE_LIMIT.WINDOW_MS);

const bodySchema = z.object({
  clientSessionId: z.string().min(8).max(64),
  durationSeconds: z.number().int().min(1).max(14_400),
  startedAt: z.string().datetime(),
  lastPath: z.string().max(256).optional(),
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

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? null;

    await recordAppSession({
      clientSessionId: parsed.data.clientSessionId,
      durationSeconds: parsed.data.durationSeconds,
      startedAt: new Date(parsed.data.startedAt),
      lastPath: parsed.data.lastPath,
      userId,
    });

    return NextResponse.json({ success: true }, { status: HTTP_STATUS.OK });
  } catch (e) {
    console.error('analytics/session:', e);
    return NextResponse.json({ success: false }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}
