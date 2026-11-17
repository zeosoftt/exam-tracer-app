import { randomUUID } from 'crypto';
import { prisma } from '@/lib/db/prisma';

export const MAX_APP_SESSION_DURATION_SECONDS = 4 * 60 * 60;

export type RecordAppSessionInput = {
  clientSessionId: string;
  durationSeconds: number;
  startedAt: Date;
  lastPath?: string;
  userId?: string | null;
};

/**
 * Tek sorguluk upsert: heartbeat başına 2 gidiş-dönüş yerine 1.
 * durationSeconds monoton artar (GREATEST), userId sonradan bağlanabilir (COALESCE).
 */
export async function recordAppSession(input: RecordAppSessionInput): Promise<void> {
  const durationSeconds = Math.min(
    Math.max(0, Math.floor(input.durationSeconds)),
    MAX_APP_SESSION_DURATION_SECONDS,
  );

  if (durationSeconds <= 0) return;

  const endedAt = new Date();
  const lastPath = input.lastPath?.slice(0, 256) ?? null;
  const userId = input.userId ?? null;

  await prisma.$executeRaw`
    INSERT INTO "app_sessions"
      ("id", "clientSessionId", "userId", "durationSeconds", "startedAt", "endedAt", "lastPath", "createdAt", "updatedAt")
    VALUES
      (${randomUUID()}, ${input.clientSessionId}, ${userId}, ${durationSeconds}, ${input.startedAt}, ${endedAt}, ${lastPath}, NOW(), NOW())
    ON CONFLICT ("clientSessionId") DO UPDATE SET
      "durationSeconds" = GREATEST("app_sessions"."durationSeconds", EXCLUDED."durationSeconds"),
      "userId" = COALESCE(EXCLUDED."userId", "app_sessions"."userId"),
      "endedAt" = EXCLUDED."endedAt",
      "lastPath" = EXCLUDED."lastPath",
      "updatedAt" = NOW()
  `;
}
