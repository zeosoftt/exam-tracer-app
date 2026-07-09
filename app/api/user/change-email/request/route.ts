/**
 * POST /api/user/change-email/request
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSession, getSessionUserId } from '@/lib/auth/requireSession';
import { prisma } from '@/lib/db/prisma';
import { comparePassword } from '@/lib/auth/password';
import { validate } from '@/lib/validation/validate';
import { changeEmailRequestSchema } from '@/lib/validation/schemas';
import { asyncHandler } from '@/lib/errors/errorHandler';
import { issueEmailChangeForUser } from '@/lib/auth/issueEmailChange';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { RATE_LIMIT, HTTP_STATUS } from '@/config/constants';
import { UnauthorizedError } from '@/lib/errors/AppError';

const limiter = rateLimit(3, RATE_LIMIT.LOGIN_WINDOW_MS);

async function changeEmailRequestHandler(req: NextRequest): Promise<NextResponse> {
  const limited = limiter(req);
  if (limited) return limited;

  const session = await requireSession();
  const userId = getSessionUserId(session);
  const { newEmail, password } = validate(changeEmailRequestSchema, await req.json());

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true, deletedAt: true, isActive: true },
  });
  if (!user || user.deletedAt !== null || !user.isActive) {
    throw new UnauthorizedError();
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { success: false, error: { message: 'Şifre hatalı' } },
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }

  await issueEmailChangeForUser(userId, newEmail);

  return NextResponse.json({
    success: true,
    message: 'Doğrulama kodu yeni e-posta adresinize gönderildi.',
  });
}

export const POST = asyncHandler(changeEmailRequestHandler);
