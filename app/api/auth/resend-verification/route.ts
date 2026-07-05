/**
 * POST /api/auth/resend-verification
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { issueVerificationEmailForUser } from '@/lib/auth/issueVerificationEmail';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { RATE_LIMIT } from '@/config/constants';
import { validate } from '@/lib/validation/validate';
import { resendVerificationSchema } from '@/lib/validation/schemas';
import { authEnumerationSafe, wrapAuthPostHandler } from '@/lib/auth/authRouteHelpers';
import { logAuth } from '@/lib/logger';

const limiter = rateLimit(5, RATE_LIMIT.LOGIN_WINDOW_MS);

async function resendVerificationHandler(req: NextRequest) {
  try {
    const { email: rawEmail } = validate(resendVerificationSchema, await req.json());
    const email = rawEmail.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, deletedAt: true, isActive: true, emailVerified: true },
    });

    if (user && user.deletedAt === null && user.isActive && !user.emailVerified) {
      await issueVerificationEmailForUser(user.id);
      logAuth('Verification email resent', user.id);
    }
  } catch {
    // Enumeration-safe: invalid body still returns success
  }

  return authEnumerationSafe(
    'Eğer bu e-posta kayıtlı ve henüz doğrulanmamışsa, yeni doğrulama kodu gönderildi. Gelen kutunuzu ve spam klasörünü kontrol edin.',
  );
}

export const POST = wrapAuthPostHandler(resendVerificationHandler, { limiter });
