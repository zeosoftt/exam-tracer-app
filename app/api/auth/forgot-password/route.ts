/**
 * Forgot Password API
 * Creates a password reset token and sends reset email
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';
import { prisma } from '@/lib/db/prisma';
import { PASSWORD_RESET_TTL_MINUTES, RATE_LIMIT } from '@/config/constants';
import { handleError } from '@/lib/errors/errorHandler';
import { logInfo, logError } from '@/lib/logger';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { sendPasswordResetEmail } from '@/lib/email/sendPasswordResetEmail';

const limiter = rateLimit(RATE_LIMIT.LOGIN_MAX_REQUESTS, RATE_LIMIT.LOGIN_WINDOW_MS);

export async function POST(req: NextRequest) {
  const limited = limiter(req);
  if (limited) return limited;

  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: { message: 'E-posta adresi gereklidir' } },
        { status: 400 }
      );
    }

    // Find user by email (excluding soft-deleted users)
    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase().trim(),
      },
    });

    // Security: Don't reveal if email exists or not
    // Always return success message to prevent email enumeration
    if (!user || user.deletedAt !== null || !user.isActive) {
      // Return success even if user doesn't exist (security best practice)
      return NextResponse.json({
        success: true,
        message: 'Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.',
      });
    }

    // Generate secure random token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + PASSWORD_RESET_TTL_MINUTES);

    // Delete any existing unused tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        used: false,
      },
    });

    // Create new reset token
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

    return NextResponse.json({
      success: true,
      message: 'Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.',
    });
  } catch (error) {
    return handleError(error);
  }
}
