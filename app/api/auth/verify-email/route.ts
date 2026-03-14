/**
 * E-posta doğrulama API
 * POST /api/auth/verify-email - token ile e-postayı doğrular
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { handleError } from '@/lib/errors/errorHandler';
import { logAuth } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token =
      typeof body?.token === 'string'
        ? body.token.trim()
        : new URL(req.url).searchParams.get('token')?.trim();

    if (!token) {
      return NextResponse.json(
        { success: false, error: { message: 'Doğrulama bağlantısı geçersiz veya eksik.' } },
        { status: 400 }
      );
    }

    const verification = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification) {
      return NextResponse.json(
        { success: false, error: { message: 'Doğrulama bağlantısı geçersiz veya süresi dolmuş.' } },
        { status: 400 }
      );
    }

    if (verification.used) {
      return NextResponse.json(
        { success: true, message: 'Bu e-posta adresi zaten doğrulanmış.' },
        { status: 200 }
      );
    }

    if (new Date() > verification.expiresAt) {
      return NextResponse.json(
        { success: false, error: { message: 'Doğrulama bağlantısının süresi dolmuş. Yeni link için kayıt e-postanızı kontrol edin veya tekrar doğrulama isteyin.' } },
        { status: 400 }
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

    return NextResponse.json({
      success: true,
      message: 'E-posta adresiniz doğrulandı. Giriş yapabilirsiniz.',
    });
  } catch (error) {
    return handleError(error);
  }
}
