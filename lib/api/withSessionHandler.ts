/**
 * Oturum gerektiren API route sarmalayıcısı.
 */

import type { NextRequest, NextResponse } from 'next/server';
import { requireSession, getSessionUserId, type AuthenticatedSession } from '@/lib/auth/requireSession';
import { asyncHandler } from '@/lib/errors/errorHandler';

export type SessionRouteContext = {
  session: AuthenticatedSession;
  userId: string;
};

export function withSessionHandler<T extends unknown[] = []>(
  handler: (req: NextRequest, ctx: SessionRouteContext, ...args: T) => Promise<NextResponse>,
) {
  return asyncHandler(async (req: NextRequest, ...args: T) => {
    const session = await requireSession();
    const userId = getSessionUserId(session);
    return handler(req, { session, userId }, ...args);
  });
}
