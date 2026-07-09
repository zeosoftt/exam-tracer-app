/**
 * POST /api/user/delete-account
 * Hesabı soft-delete eder ve tüm oturumları geçersiz kılar.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSession, getSessionUserId } from '@/lib/auth/requireSession';
import { prisma } from '@/lib/db/prisma';
import { comparePassword } from '@/lib/auth/password';
import { validate } from '@/lib/validation/validate';
import { asyncHandler } from '@/lib/errors/errorHandler';
import { incrementUserTokenVersion } from '@/lib/auth/incrementTokenVersion';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { RATE_LIMIT, HTTP_STATUS } from '@/config/constants';
import { UnauthorizedError } from '@/lib/errors/AppError';

const limiter = rateLimit(3, RATE_LIMIT.LOGIN_WINDOW_MS);

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Şifre gerekli'),
  confirm: z.literal(true, { errorMap: () => ({ message: 'Hesap silme onayı gerekli' }) }),
});

async function deleteAccountHandler(req: NextRequest): Promise<NextResponse> {
  const limited = limiter(req);
  if (limited) return limited;

  const session = await requireSession();
  const userId = getSessionUserId(session);
  const { password } = validate(deleteAccountSchema, await req.json());

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true, deletedAt: true },
  });
  if (!user || user.deletedAt !== null) {
    throw new UnauthorizedError();
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { success: false, error: { message: 'Şifre hatalı' } },
      { status: HTTP_STATUS.BAD_REQUEST },
    );
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      deletedAt: new Date(),
      isActive: false,
      email: `deleted_${userId}_${Date.now()}@removed.local`,
    },
  });
  await incrementUserTokenVersion(userId);

  return NextResponse.json({
    success: true,
    message: 'Hesabınız silindi. Oturumunuz kapatılacak.',
  });
}

export const POST = asyncHandler(deleteAccountHandler);
