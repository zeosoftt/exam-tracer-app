/**
 * Reset Password API
 * Validates token and updates user password
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/lib/auth/password';
import { authJsonError, authJsonSuccess, readAuthJsonBody, wrapAuthPostHandler } from '@/lib/auth/authRouteHelpers';

async function resetPasswordHandler(req: NextRequest): Promise<NextResponse> {
  const body = await readAuthJsonBody<{ token?: string; password?: string }>(req);
  const { token, password } = body;

  if (!token || typeof token !== 'string') {
    return authJsonError('Geçersiz şifre sıfırlama bağlantısı');
  }

  if (!password || typeof password !== 'string') {
    return authJsonError('Şifre gereklidir');
  }

  if (password.length < 8) {
    return authJsonError('Şifre en az 8 karakter olmalıdır');
  }

  if (!/[A-Z]/.test(password)) {
    return authJsonError('Şifre en az bir büyük harf içermelidir');
  }

  if (!/[a-z]/.test(password)) {
    return authJsonError('Şifre en az bir küçük harf içermelidir');
  }

  if (!/[0-9]/.test(password)) {
    return authJsonError('Şifre en az bir rakam içermelidir');
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken) {
    return authJsonError('Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı');
  }

  if (resetToken.used) {
    return authJsonError('Bu şifre sıfırlama bağlantısı daha önce kullanılmış');
  }

  if (new Date() > resetToken.expiresAt) {
    return authJsonError('Şifre sıfırlama bağlantısının süresi dolmuş');
  }

  if (!resetToken.user || resetToken.user.deletedAt !== null || !resetToken.user.isActive) {
    return authJsonError('Kullanıcı bulunamadı veya hesap aktif değil');
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    }),
  ]);

  await prisma.passwordResetToken.deleteMany({
    where: {
      userId: resetToken.userId,
      used: false,
      id: { not: resetToken.id },
    },
  });

  return authJsonSuccess({ success: true, message: 'Şifreniz başarıyla güncellendi' });
}

export const POST = wrapAuthPostHandler(resetPasswordHandler);
