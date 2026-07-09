/**
 * POST /api/user/change-email/confirm
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireSession, getSessionUserId } from '@/lib/auth/requireSession';
import { prisma } from '@/lib/db/prisma';
import { validate } from '@/lib/validation/validate';
import { changeEmailConfirmSchema } from '@/lib/validation/schemas';
import { asyncHandler } from '@/lib/errors/errorHandler';
import { isValidVerificationCode, normalizeVerificationCode } from '@/lib/auth/verificationCode';
import { incrementUserTokenVersion } from '@/lib/auth/incrementTokenVersion';
import { ensureProductionTablesOnce } from '@/lib/db/ensureProductionTables';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { RATE_LIMIT, HTTP_STATUS } from '@/config/constants';
import { BadRequestError } from '@/lib/errors/AppError';

const limiter = rateLimit(10, RATE_LIMIT.LOGIN_WINDOW_MS);

async function changeEmailConfirmHandler(req: NextRequest): Promise<NextResponse> {
  const limited = limiter(req);
  if (limited) return limited;

  const session = await requireSession();
  const userId = getSessionUserId(session);
  const { code: rawCode } = validate(changeEmailConfirmSchema, await req.json());
  const code = normalizeVerificationCode(rawCode);

  if (!isValidVerificationCode(code)) {
    throw new BadRequestError('Doğrulama kodu 6 haneli olmalıdır.');
  }

  await ensureProductionTablesOnce(prisma);

  const token = await prisma.emailChangeToken.findFirst({
    where: { userId, token: code, used: false },
    orderBy: { createdAt: 'desc' },
  });

  if (!token || new Date() > token.expiresAt) {
    throw new BadRequestError('Doğrulama kodu geçersiz veya süresi dolmuş.');
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { email: token.newEmail, emailVerified: true },
    }),
    prisma.emailChangeToken.update({ where: { id: token.id }, data: { used: true } }),
  ]);
  await incrementUserTokenVersion(userId);

  return NextResponse.json({
    success: true,
    message: 'E-posta adresiniz güncellendi. Lütfen tekrar giriş yapın.',
    data: { email: token.newEmail },
  });
}

export const POST = asyncHandler(changeEmailConfirmHandler);
