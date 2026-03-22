/**
 * E-posta doğrulama token'ı oluşturur ve doğrulama maili gönderir
 */

import { randomBytes } from 'crypto';
import { prisma } from '@/lib/db/prisma';
import { sendVerificationEmail, buildVerificationUrl } from '@/lib/email';
import { logError } from '@/lib/logger';

const TOKEN_TTL_HOURS = 24;

export async function issueVerificationEmailForUser(userId: string): Promise<void> {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { id: true, email: true, firstName: true, emailVerified: true },
  });
  if (!user || user.emailVerified) return;

  const verificationToken = randomBytes(32).toString('hex');
  const verificationExpiresAt = new Date();
  verificationExpiresAt.setHours(verificationExpiresAt.getHours() + TOKEN_TTL_HOURS);

  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      token: verificationToken,
      expiresAt: verificationExpiresAt,
    },
  });

  const verifyUrl = buildVerificationUrl(verificationToken);
  await sendVerificationEmail({
    to: user.email,
    firstName: user.firstName,
    verifyUrl,
  }).catch((err) => logError('Verification email send failed', err as Error));
}
