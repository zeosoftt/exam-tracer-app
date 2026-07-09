/**
 * Production tabloları / indeksler — migration repo dışında DDL ile.
 */

import type { PrismaClient } from '@prisma/client';

let ensureAttempted = false;

export async function ensureProductionTablesOnce(prisma: PrismaClient): Promise<void> {
  if (ensureAttempted) return;
  ensureAttempted = true;

  const statements = [
    `CREATE TABLE IF NOT EXISTS "email_change_tokens" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "newEmail" TEXT NOT NULL,
      "token" TEXT NOT NULL,
      "expiresAt" TIMESTAMP(3) NOT NULL,
      "used" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "email_change_tokens_pkey" PRIMARY KEY ("id")
    );`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "email_change_tokens_token_key" ON "email_change_tokens"("token");`,
    `CREATE INDEX IF NOT EXISTS "email_change_tokens_userId_idx" ON "email_change_tokens"("userId");`,
    `CREATE TABLE IF NOT EXISTS "audit_logs" (
      "id" TEXT NOT NULL,
      "actorId" TEXT NOT NULL,
      "action" TEXT NOT NULL,
      "resource" TEXT,
      "metadata" JSONB,
      "ipAddress" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
    );`,
    `CREATE INDEX IF NOT EXISTS "audit_logs_actorId_idx" ON "audit_logs"("actorId");`,
    `CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs"("action");`,
    `CREATE INDEX IF NOT EXISTS "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "memberships_user_org_active_unique"
      ON "memberships" ("userId", "organizationId")
      WHERE "deletedAt" IS NULL;`,
  ];

  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch {
      // Yetki yoksa sessiz geç
    }
  }
}
