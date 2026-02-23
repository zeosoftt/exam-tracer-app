/**
 * Forgot Password API
 * Creates a password reset token and sends reset email
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { randomBytes } from 'crypto';
import { handleError } from '@/lib/errors/errorHandler';
import { logInfo } from '@/lib/logger';

export async function POST(req: NextRequest) {
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
    expiresAt.setHours(expiresAt.getHours() + 1); // Token valid for 1 hour

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

    // Generate reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;

    // TODO: Send email with reset link
    // For now, log it (in production, use email service like SendGrid, Resend, etc.)
    logInfo('Password reset token generated', {
      userId: user.id,
      email: user.email,
      resetUrl,
      expiresAt: expiresAt.toISOString(),
    });

    // In production, uncomment and configure email service:
    /*
    await sendPasswordResetEmail({
      to: user.email,
      name: `${user.firstName} ${user.lastName}`,
      resetUrl,
    });
    */

    return NextResponse.json({
      success: true,
      message: 'Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.',
    });
  } catch (error) {
    return handleError(error);
  }
}
