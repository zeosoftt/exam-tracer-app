/**
 * E-posta doğrulama API
 * POST /api/auth/verify-email - token ile e-postayı doğrular
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { logAuth } from '@/lib/logger';
import { authJsonError, authJsonSuccess, wrapAuthPostHandler } from '@/lib/auth/authRouteHelpers';

async function verifyEmailHandler(req: NextRequest): Promise<NextResponse> {
  const body = await req.json().catch(() => ({}));
  const token =
    typeof body?.token === 'string' ? body.token.trim() : new URL(req.url).searchParams.get('token')?.trim();

  if (!token) {
    return authJsonError('Doğrulama bağlantısı geçersiz veya eksik.');
  }

  const verification = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!verification) {
    return authJsonError('Doğrulama bağlantısı geçersiz veya süresi dolmuş.');
  }

  if (verification.used) {
    return authJsonSuccess({ success: true, message: 'Bu e-posta adresi zaten doğrulanmış.' });
  }

  if (new Date() > verification.expiresAt) {
    return authJsonError(
      'Doğrulama bağlantısının süresi dolmuş. Yeni link için kayıt e-postanızı kontrol edin veya tekrar doğrulama isteyin.',
    );
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerified: true },
    }),
    prisma.emailVerificationToken.update({
      where: { id: verification.id },
      data: { used: true },
    }),
  ]);

  logAuth('Email verified', verification.userId, { email: verification.user.email });

  return authJsonSuccess({
    success: true,
    message: 'E-posta adresiniz doğrulandı. Giriş yapabilirsiniz.',
  });
}

export const POST = wrapAuthPostHandler(verifyEmailHandler);
