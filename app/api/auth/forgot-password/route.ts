/**
 * Forgot Password API
 */

import { NextRequest } from 'next/server';
import { createHash, randomBytes } from 'crypto';
import { prisma } from '@/lib/db/prisma';
import { PASSWORD_RESET_TTL_MINUTES, RATE_LIMIT } from '@/config/constants';
import { logInfo, logError } from '@/lib/logger';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { sendPasswordResetEmail } from '@/lib/email/sendPasswordResetEmail';
import { validate } from '@/lib/validation/validate';
import { forgotPasswordSchema } from '@/lib/validation/schemas';
import { authEnumerationSafe, wrapAuthPostHandler } from '@/lib/auth/authRouteHelpers';

const limiter = rateLimit(RATE_LIMIT.LOGIN_MAX_REQUESTS, RATE_LIMIT.LOGIN_WINDOW_MS);
const ENUMERATION_SAFE_MESSAGE =
  'Eğer bu e-posta adresi kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.';

async function forgotPasswordHandler(req: NextRequest) {
  try {
    const { email: rawEmail } = validate(forgotPasswordSchema, await req.json());
    const email = rawEmail.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.deletedAt !== null || !user.isActive) {
      return authEnumerationSafe(ENUMERATION_SAFE_MESSAGE);
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + PASSWORD_RESET_TTL_MINUTES);

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, used: false } });
    await prisma.passwordResetToken.create({ data: { userId: user.id, token, expiresAt } });

    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${encodeURIComponent(token)}`;
    const mailOk = await sendPasswordResetEmail({
      to: user.email,
      firstName: user.firstName,
      resetUrl,
      ttlMinutes: PASSWORD_RESET_TTL_MINUTES,
    });

    const tokenFingerprint = createHash('sha256').update(token).digest('hex').slice(0, 12);
    const emailHash = createHash('sha256').update(user.email).digest('hex').slice(0, 12);

    if (!mailOk) {
      logError('Password reset email delivery failed', new Error('Resend failed'), {
        userId: user.id,
        emailHash,
        tokenFingerprint,
      });
    } else {
      logInfo('Password reset email sent', { userId: user.id, emailHash, tokenFingerprint });
    }
  } catch {
    // Invalid body → enumeration-safe response
  }

  return authEnumerationSafe(ENUMERATION_SAFE_MESSAGE);
}

export const POST = wrapAuthPostHandler(forgotPasswordHandler, { limiter });
