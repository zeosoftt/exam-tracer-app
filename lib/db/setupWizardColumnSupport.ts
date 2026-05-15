/**
 * setupWizardCompletedAt kolonu migration uygulanmadan önce DB'de yoksa Prisma P2022 fırlatır.
 * Bu yardımcılar uygulamanın çökmesini önler; üretimde migrate deploy çalıştırılmalıdır.
 */

import { Prisma } from '@prisma/client';

export function isMissingSetupWizardColumnError(error: unknown): boolean {
  const msg =
    error instanceof Prisma.PrismaClientKnownRequestError
      ? error.message
      : error instanceof Error
        ? error.message
        : String(error ?? '');
  if (!msg.includes('setupWizardCompletedAt')) return false;
  return (
    msg.includes('does not exist') ||
    msg.includes('Unknown column') ||
    (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2022')
  );
}
