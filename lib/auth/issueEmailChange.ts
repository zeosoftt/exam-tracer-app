/**
 * E-posta değişikliği — kod oluştur ve yeni adrese gönder.
 */

import { prisma } from '@/lib/db/prisma';
import { EMAIL_VERIFICATION_TTL_HOURS } from '@/config/constants';
import { generateEmailVerificationCode } from '@/lib/auth/verificationCode';
import { sendEmailChangeVerification } from '@/lib/email/sendEmailChangeVerification';
import { ensureProductionTablesOnce } from '@/lib/db/ensureProductionTables';
import { ConflictError } from '@/lib/errors/AppError';

export async function issueEmailChangeForUser(userId: string, newEmail: string): Promise<void> {
  const normalized = newEmail.toLowerCase().trim();
  await ensureProductionTablesOnce(prisma);

  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null, isActive: true },
    select: { id: true, email: true, firstName: true },
  });
  if (!user) throw new Error('User not found');
  if (user.email === normalized) {
    throw new ConflictError('Yeni e-posta mevcut adresinizle aynı.');
  }

  const taken = await prisma.user.findFirst({
    where: { email: normalized, deletedAt: null, NOT: { id: userId } },
    select: { id: true },
  });
  if (taken) {
    throw new ConflictError('Bu e-posta adresi kullanılamıyor.');
  }

  const code = generateEmailVerificationCode();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + EMAIL_VERIFICATION_TTL_HOURS);

  await prisma.$transaction([
    prisma.emailChangeToken.deleteMany({ where: { userId, used: false } }),
    prisma.emailChangeToken.create({
      data: { userId, newEmail: normalized, token: code, expiresAt },
    }),
  ]);

  await sendEmailChangeVerification({
    to: normalized,
    firstName: user.firstName,
    verificationCode: code,
    codeValidityHours: EMAIL_VERIFICATION_TTL_HOURS,
  });
}
