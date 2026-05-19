/**
 * Forgot Password API
 * Creates a password reset token and sends reset email
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';
import { prisma } from '@/lib/db/prisma';
import { PASSWORD_RESET_TTL_MINUTES, RATE_LIMIT } from '@/config/constants';
import { logInfo, logError } from '@/lib/logger';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { sendPasswordResetEmail } from '@/lib/email/sendPasswordResetEmail';
import {
  authEnumerationSafe,
  readAuthJsonBody,
  wrapAuthPostHandler,
} from '@/lib/auth/authRouteHelpers';

const limiter = rateLimit(RATE_LIMIT.LOGIN_MAX_REQUESTS, RATE_LIMIT.LOGIN_WINDOW_MS);

async function forgotPasswordHandler(req: NextRequest): Promise<NextResponse> {
  const body = await readAuthJsonBody<{ email?: string }>(req);
  const { email } = body;

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: { message: 'E-posta adresi gereklidir' } }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase().trim(),
    },
  });

  if (!user || user.deletedAt !== null || !user.isActive) {
    return authEnumerationSafe('Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.');
  }

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + PASSWORD_RESET_TTL_MINUTES);

  await prisma.passwordResetToken.deleteMany({
    where: {
      userId: user.id,
      used: false,
    },
  });

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${encodeURIComponent(token)}`;

  const mailOk = await sendPasswordResetEmail({
    to: user.email,
    firstName: user.firstName,
    resetUrl,
    ttlMinutes: PASSWORD_RESET_TTL_MINUTES,
  });

  const tokenFingerprint = createHash('sha256').update(token).digest('hex').slice(0, 12);
  if (!mailOk) {
    logError(
      'Password reset email delivery failed (user should use forgot-password again)',
      new Error('Resend failed'),
      {
        userId: user.id,
        emailHash: createHash('sha256').update(user.email).digest('hex').slice(0, 12),
        tokenFingerprint,
        expiresAt: expiresAt.toISOString(),
        ttlMinutes: PASSWORD_RESET_TTL_MINUTES,
      },
    );
  } else {
    logInfo('Password reset flow completed', {
      userId: user.id,
      emailHash: createHash('sha256').update(user.email).digest('hex').slice(0, 12),
      tokenFingerprint,
      expiresAt: expiresAt.toISOString(),
      ttlMinutes: PASSWORD_RESET_TTL_MINUTES,
    });
  }

  return authEnumerationSafe('Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.');
}

export const POST = wrapAuthPostHandler(forgotPasswordHandler, { limiter });
