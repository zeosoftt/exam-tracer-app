/**
 * GET /api/auth/dev-verification-code?email=...
 * Yalnızca development — local test için son doğrulama kodunu döner.
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { RATE_LIMIT } from '@/config/constants';
import { authSuccess } from '@/lib/auth/responses';
import { wrapAuthGetHandler } from '@/lib/auth/authRouteHelpers';
import { NotFoundError } from '@/lib/errors/AppError';

const limiter = rateLimit(20, RATE_LIMIT.LOGIN_WINDOW_MS);

function isDevVerificationEnabled(): boolean {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  return (
    process.env.NODE_ENV === 'development' &&
    process.env.ENABLE_DEV_VERIFICATION_CODE === 'true'
  );
}

async function devVerificationCodeHandler(req: NextRequest) {
  if (!isDevVerificationEnabled()) {
    throw new NotFoundError();
  }

  const limited = limiter(req);
  if (limited) return limited;

  const email = new URL(req.url).searchParams.get('email')?.toLowerCase().trim();
  if (!email) {
    return authSuccess({ code: null });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, emailVerified: true },
  });

  if (!user || user.emailVerified) {
    return authSuccess({ code: null });
  }

  const token = await prisma.emailVerificationToken.findFirst({
    where: { userId: user.id, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
    select: { token: true },
  });

  return authSuccess({ code: token?.token ?? null });
}

export const GET = wrapAuthGetHandler(devVerificationCodeHandler);
