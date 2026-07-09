/**
 * E-posta doğrulama API
 * POST /api/auth/verify-email
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { logAuth } from '@/lib/logger';
import { isValidVerificationCode, normalizeVerificationCode } from '@/lib/auth/verificationCode';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { RATE_LIMIT } from '@/config/constants';
import { validate } from '@/lib/validation/validate';
import { verifyEmailSchema } from '@/lib/validation/schemas';
import { authFailure, authMessage } from '@/lib/auth/responses';
import { wrapAuthPostHandler } from '@/lib/auth/authRouteHelpers';

const limiter = rateLimit(10, RATE_LIMIT.LOGIN_WINDOW_MS);

async function verifyEmailHandler(req: NextRequest) {
  const { email: rawEmail, code: rawCode } = validate(verifyEmailSchema, await req.json());
  const email = rawEmail.toLowerCase().trim();
  const code = normalizeVerificationCode(rawCode);

  if (!isValidVerificationCode(code)) {
    return authFailure('Doğrulama kodu 6 haneli olmalıdır.');
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, emailVerified: true, deletedAt: true, isActive: true },
  });

  if (!user || user.deletedAt !== null || !user.isActive) {
    return authFailure('Doğrulama kodu geçersiz veya süresi dolmuş.');
  }

  if (user.emailVerified) {
    return authFailure('Doğrulama kodu geçersiz veya süresi dolmuş.');
  }

  const verification = await prisma.emailVerificationToken.findFirst({
    where: { userId: user.id, token: code, used: false },
    orderBy: { createdAt: 'desc' },
  });

  if (!verification) {
    return authFailure('Doğrulama kodu geçersiz veya süresi dolmuş.');
  }

  if (new Date() > verification.expiresAt) {
    return authFailure('Doğrulama kodunun süresi dolmuş. Yeni kod için “Tekrar gönder”e tıklayın.');
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } }),
    prisma.emailVerificationToken.update({ where: { id: verification.id }, data: { used: true } }),
  ]);

  logAuth('Email verified', user.id, { email: user.email });
  return authMessage('E-posta adresiniz doğrulandı. Giriş yapabilirsiniz.');
}

export const POST = wrapAuthPostHandler(verifyEmailHandler, { limiter });
