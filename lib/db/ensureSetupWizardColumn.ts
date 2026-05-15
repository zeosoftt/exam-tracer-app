/**
 * Migration henüz uygulanmamışsa (özellikle Supabase) Prisma şeması DB ile uyuşmaz.
 * DB kullanıcısı DDL yetkisine sahipse kolon burada oluşturulur; süreç başına bir kez denenir.
 */

import type { PrismaClient } from '@prisma/client';

let setupWizardColumnEnsureAttempted = false;

export async function ensureSetupWizardColumnOnce(prisma: PrismaClient): Promise<void> {
  if (setupWizardColumnEnsureAttempted) return;
  setupWizardColumnEnsureAttempted = true;
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "setupWizardCompletedAt" TIMESTAMP(3);`,
    );
  } catch {
    // Yetki yoksa veya PG sürümü desteklemiyorsa sessiz geç; sayfa/API fallback kullanır.
  }
}
