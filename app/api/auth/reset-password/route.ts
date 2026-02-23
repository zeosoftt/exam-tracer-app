/**
 * Reset Password API
 * Validates token and updates user password
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/lib/auth/password';
import { handleError } from '@/lib/errors/errorHandler';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: { message: 'Geçersiz şifre sıfırlama bağlantısı' } },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: { message: 'Şifre gereklidir' } },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: { message: 'Şifre en az 8 karakter olmalıdır' } },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: { message: 'Şifre en az bir büyük harf içermelidir' } },
        { status: 400 }
      );
    }

    if (!/[a-z]/.test(password)) {
      return NextResponse.json(
        { error: { message: 'Şifre en az bir küçük harf içermelidir' } },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: { message: 'Şifre en az bir rakam içermelidir' } },
        { status: 400 }
      );
    }

    // Find token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: { message: 'Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı' } },
        { status: 400 }
      );
    }

    // Check if token is used
    if (resetToken.used) {
      return NextResponse.json(
        { error: { message: 'Bu şifre sıfırlama bağlantısı daha önce kullanılmış' } },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json(
        { error: { message: 'Şifre sıfırlama bağlantısının süresi dolmuş' } },
        { status: 400 }
      );
    }

    // Check if user exists and is active
    if (!resetToken.user || resetToken.user.deletedAt !== null || !resetToken.user.isActive) {
      return NextResponse.json(
        { error: { message: 'Kullanıcı bulunamadı veya hesap aktif değil' } },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update user password and mark token as used (in transaction)
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

    // Delete all other unused tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: resetToken.userId,
        used: false,
        id: { not: resetToken.id },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Şifreniz başarıyla güncellendi',
    });
  } catch (error) {
    return handleError(error);
  }
}
