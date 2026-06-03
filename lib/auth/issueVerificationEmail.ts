/**
 * E-posta doğrulama kodu oluşturur ve doğrulama maili gönderir
 */

import { prisma } from '@/lib/db/prisma';
import { EMAIL_VERIFICATION_TTL_HOURS } from '@/config/constants';
import { sendVerificationEmail } from '@/lib/email';
import { generateEmailVerificationCode } from '@/lib/auth/verificationCode';
import { logError } from '@/lib/logger';

export async function issueVerificationEmailForUser(userId: string): Promise<void> {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { id: true, email: true, firstName: true, emailVerified: true },
  });
  if (!user || user.emailVerified) return;

  const verificationCode = generateEmailVerificationCode();
  const verificationExpiresAt = new Date();
  verificationExpiresAt.setHours(verificationExpiresAt.getHours() + EMAIL_VERIFICATION_TTL_HOURS);

  await prisma.$transaction([
    prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id, used: false },
    }),
    prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: verificationCode,
        expiresAt: verificationExpiresAt,
      },
    }),
  ]);

  await sendVerificationEmail({
    to: user.email,
    firstName: user.firstName,
    verificationCode,
    codeValidityHours: EMAIL_VERIFICATION_TTL_HOURS,
  }).catch((err) => logError('Verification email send failed', err as Error));
}
