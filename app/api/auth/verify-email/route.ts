/**
 * E-posta doğrulama API
 * POST /api/auth/verify-email — e-posta + 6 haneli kod ile doğrular
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { logAuth } from '@/lib/logger';
import { isValidVerificationCode, normalizeVerificationCode } from '@/lib/auth/verificationCode';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { RATE_LIMIT } from '@/config/constants';
import {
  authJsonError,
  authJsonSuccess,
  readAuthJsonBody,
  wrapAuthPostHandler,
} from '@/lib/auth/authRouteHelpers';

const bodySchema = z.object({
  email: z.string().email().max(255),
  code: z.string().min(6).max(12),
});

const limiter = rateLimit(10, RATE_LIMIT.LOGIN_WINDOW_MS);

async function verifyEmailHandler(req: NextRequest): Promise<NextResponse> {
  const json = await readAuthJsonBody(req);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return authJsonError('Geçerli bir e-posta adresi ve 6 haneli doğrulama kodu girin.');
  }

  const email = parsed.data.email.toLowerCase().trim();
  const code = normalizeVerificationCode(parsed.data.code);

  if (!isValidVerificationCode(code)) {
    return authJsonError('Doğrulama kodu 6 haneli olmalıdır.');
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, emailVerified: true, deletedAt: true, isActive: true },
  });

  if (!user || user.deletedAt !== null || !user.isActive) {
    return authJsonError('Doğrulama kodu geçersiz veya süresi dolmuş.');
  }

  if (user.emailVerified) {
    return authJsonSuccess({ success: true, message: 'Bu e-posta adresi zaten doğrulanmış.' });
  }

  const verification = await prisma.emailVerificationToken.findFirst({
    where: {
      userId: user.id,
      token: code,
      used: false,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!verification) {
    return authJsonError('Doğrulama kodu geçersiz veya süresi dolmuş.');
  }

  if (new Date() > verification.expiresAt) {
    return authJsonError(
      'Doğrulama kodunun süresi dolmuş. Yeni kod için “Tekrar gönder”e tıklayın.',
    );
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    }),
    prisma.emailVerificationToken.update({
      where: { id: verification.id },
      data: { used: true },
    }),
  ]);

  logAuth('Email verified', user.id, { email: user.email });

  return authJsonSuccess({
    success: true,
    message: 'E-posta adresiniz doğrulandı. Giriş yapabilirsiniz.',
  });
}

export const POST = wrapAuthPostHandler(verifyEmailHandler, { limiter });
