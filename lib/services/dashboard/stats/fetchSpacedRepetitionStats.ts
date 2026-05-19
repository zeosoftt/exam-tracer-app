import type { PrismaClient } from '@prisma/client';
import { effectiveNextReviewAt } from '@/lib/utils/spacedRepetition';
import type { SpacedRepetitionStats, StatsDb } from '@/lib/services/dashboard/stats/types';

type ReviewProgressRow = {
  topicId: string;
  completedAt: Date | null;
  nextReviewAt: Date | null;
  spacedRepetitionLevel: number;
  topic: {
    name: string;
    subject: { name: string; section: { name: string } };
  };
};

async function fetchReviewProgressList(
  db: PrismaClient,
  userId: string,
  examId: string,
): Promise<ReviewProgressRow[]> {
  const topicScope = {
    subject: { section: { examId, deletedAt: null }, deletedAt: null },
    deletedAt: null,
  };

  try {
    const rows = await db.userProgress.findMany({
      where: {
        userId,
        deletedAt: null,
        status: { in: ['COMPLETED', 'REVIEWED'] },
        OR: [{ completedAt: { not: null } }, { nextReviewAt: { not: null } }],
        topic: topicScope,
      },
      select: {
        topicId: true,
        completedAt: true,
        nextReviewAt: true,
        spacedRepetitionLevel: true,
        topic: {
          select: {
            name: true,
            subject: {
              select: { name: true, section: { select: { name: true } } },
            },
          },
        },
      },
    });
    return rows.map((r) => ({
      topicId: r.topicId,
      completedAt: r.completedAt,
      nextReviewAt: r.nextReviewAt ?? null,
      spacedRepetitionLevel: r.spacedRepetitionLevel,
      topic: r.topic,
    }));
  } catch (e: unknown) {
    const err = e as { name?: string; message?: string; code?: string };
    const isStaleClient =
      err.name === 'PrismaClientValidationError' ||
      (typeof err.message === 'string' && err.message.includes('Unknown argument'));
    const isMissingColumn = err.code === 'P2022';
    if (!isStaleClient && !isMissingColumn) throw e;

    const rows = await db.userProgress.findMany({
      where: {
        userId,
        deletedAt: null,
        status: { in: ['COMPLETED', 'REVIEWED'] },
        completedAt: { not: null },
        topic: topicScope,
      },
      select: {
        topicId: true,
        completedAt: true,
        topic: {
          select: {
            name: true,
            subject: {
              select: { name: true, section: { select: { name: true } } },
            },
          },
        },
      },
    });
    return rows.map((r) => ({
      topicId: r.topicId,
      completedAt: r.completedAt,
      nextReviewAt: null,
      spacedRepetitionLevel: 0,
      topic: r.topic,
    }));
  }
}

const SCHEDULE_EXPLANATION =
  'Unutma eğrisine göre tekrar aralıkları: 1 → 3 → 7 → 14 → 30 → 60 → 120 gün. Konuyu tamamlayınca ilk tekrar 1 gün sonrasına planlanır; her “Tekrar ettim” ile sonraki aralık uzar.';

export async function fetchSpacedRepetitionStats(
  db: StatsDb,
  userId: string,
  examId: string,
  isCoreScope: boolean,
): Promise<SpacedRepetitionStats> {
  const reviewProgressList = isCoreScope ? [] : await fetchReviewProgressList(db, userId, examId);

  const nowMs = Date.now();
  const dayMs = 86400000;
  const scheduleItems = reviewProgressList
    .map((row) => {
      const effective = effectiveNextReviewAt(row.nextReviewAt, row.completedAt);
      if (!effective) return null;
      const t = effective.getTime();
      const daysUntil = Math.ceil((t - nowMs) / dayMs);
      return {
        topicId: row.topicId,
        topicName: row.topic.name,
        subjectName: row.topic.subject.name,
        sectionName: row.topic.subject.section.name,
        nextReviewAt: effective.toISOString(),
        overdue: t <= nowMs,
        daysUntil,
        level: row.spacedRepetitionLevel,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x != null)
    .sort((a, b) => new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime());

  const overdue = scheduleItems.filter((i) => i.overdue).length;
  const dueWithinWeek = scheduleItems.filter(
    (i) => !i.overdue && i.daysUntil <= 7 && i.daysUntil >= 0,
  ).length;

  return {
    summary: {
      overdue,
      dueWithinWeek,
      totalScheduled: scheduleItems.length,
    },
    scheduleExplanation: SCHEDULE_EXPLANATION,
    items: isCoreScope ? [] : scheduleItems.slice(0, 20),
  };
}
