/**
 * Reset Password API
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/lib/auth/password';
import { validate } from '@/lib/validation/validate';
import { resetPasswordSchema } from '@/lib/validation/schemas';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { RATE_LIMIT } from '@/config/constants';
import { authFailure, authMessage } from '@/lib/auth/responses';
import { wrapAuthPostHandler } from '@/lib/auth/authRouteHelpers';
import { logAuth } from '@/lib/logger';

const limiter = rateLimit(RATE_LIMIT.LOGIN_MAX_REQUESTS, RATE_LIMIT.LOGIN_WINDOW_MS);

async function resetPasswordHandler(req: NextRequest) {
  const { token, password } = validate(resetPasswordSchema, await req.json());

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken) {
    return authFailure('Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı');
  }

  if (resetToken.used) {
    return authFailure('Bu şifre sıfırlama bağlantısı daha önce kullanılmış');
  }

  if (new Date() > resetToken.expiresAt) {
    return authFailure('Şifre sıfırlama bağlantısının süresi dolmuş');
  }

  if (!resetToken.user || resetToken.user.deletedAt !== null || !resetToken.user.isActive) {
    return authFailure('Kullanıcı bulunamadı veya hesap aktif değil');
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { used: true } }),
  ]);

  await prisma.passwordResetToken.deleteMany({
    where: { userId: resetToken.userId, used: false, id: { not: resetToken.id } },
  });

  logAuth('Password reset completed', resetToken.userId);
  return authMessage('Şifreniz başarıyla güncellendi');
}

export const POST = wrapAuthPostHandler(resetPasswordHandler, { limiter });
