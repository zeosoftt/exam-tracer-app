/**
 * Change Password API
 * POST: change current user password (currentPassword, newPassword)
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSession, getSessionUserId } from '@/lib/auth/requireSession';
import { prisma } from '@/lib/db/prisma';
import { comparePassword, hashPassword } from '@/lib/auth/password';
import { validate } from '@/lib/validation/validate';
import { changePasswordSchema } from '@/lib/validation/schemas';
import { asyncHandler } from '@/lib/errors/errorHandler';
import { UnauthorizedError } from '@/lib/errors/AppError';
import { HTTP_STATUS } from '@/config/constants';
import { incrementUserTokenVersion } from '@/lib/auth/incrementTokenVersion';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { RATE_LIMIT } from '@/config/constants';

const limiter = rateLimit(5, RATE_LIMIT.LOGIN_WINDOW_MS);

async function changePasswordHandler(req: NextRequest): Promise<NextResponse> {
  const limited = limiter(req);
  if (limited) return limited;

  const session = await requireSession();
  const userId = getSessionUserId(session);

  const body = await req.json();
  const { currentPassword, newPassword } = validate(changePasswordSchema, body);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!user) {
    throw new UnauthorizedError();
  }

  const valid = await comparePassword(currentPassword, user.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { success: false, error: { message: 'Mevcut şifre hatalı' } },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
  await incrementUserTokenVersion(userId);

  return NextResponse.json({ success: true, message: 'Şifre güncellendi' });
}

export const POST = asyncHandler(changePasswordHandler);
