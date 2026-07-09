/**
 * Migration henüz uygulanmamışsa güvenlik kolonlarını ekler (DDL yetkisi varsa).
 */

import type { PrismaClient } from '@prisma/client';

let ensureAttempted = false;

export async function ensureUserSecurityColumnsOnce(prisma: PrismaClient): Promise<void> {
  if (ensureAttempted) return;
  ensureAttempted = true;
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tokenVersion" INTEGER NOT NULL DEFAULT 0;`,
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailNotifications" BOOLEAN NOT NULL DEFAULT true;`,
    );
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "studyReminders" BOOLEAN NOT NULL DEFAULT true;`,
    );
  } catch {
    // Yetki yoksa sessiz geç
  }
}
