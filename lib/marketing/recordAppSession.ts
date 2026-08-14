import { prisma } from '@/lib/db/prisma';

export const MAX_APP_SESSION_DURATION_SECONDS = 4 * 60 * 60;

export type RecordAppSessionInput = {
  clientSessionId: string;
  durationSeconds: number;
  startedAt: Date;
  lastPath?: string;
  userId?: string | null;
};

export async function recordAppSession(input: RecordAppSessionInput): Promise<void> {
  const durationSeconds = Math.min(
    Math.max(0, Math.floor(input.durationSeconds)),
    MAX_APP_SESSION_DURATION_SECONDS,
  );

  if (durationSeconds <= 0) return;

  const endedAt = new Date();
  const lastPath = input.lastPath?.slice(0, 256) ?? null;

  const existing = await prisma.appSession.findUnique({
    where: { clientSessionId: input.clientSessionId },
    select: { durationSeconds: true, userId: true },
  });

  const mergedDuration = Math.max(existing?.durationSeconds ?? 0, durationSeconds);
  const mergedUserId = input.userId ?? existing?.userId ?? null;

  await prisma.appSession.upsert({
    where: { clientSessionId: input.clientSessionId },
    create: {
      clientSessionId: input.clientSessionId,
      userId: mergedUserId,
      durationSeconds: mergedDuration,
      startedAt: input.startedAt,
      endedAt,
      lastPath,
    },
    update: {
      userId: mergedUserId,
      durationSeconds: mergedDuration,
      endedAt,
      lastPath,
    },
  });
}
