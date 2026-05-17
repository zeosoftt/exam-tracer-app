/**
 * Sınav bazında konu tamamlanma özeti (dashboard ile aynı mantık: COMPLETED sayısı / toplam konu).
 */

import type { PrismaClient } from '@prisma/client';

export type ExamTopicProgress = {
  completed: number;
  total: number;
  pct: number;
};

export async function getTopicCompletionByExamIds(
  prisma: PrismaClient,
  userId: string,
  examIds: string[],
): Promise<Record<string, ExamTopicProgress>> {
  const unique = [...new Set(examIds.filter(Boolean))];
  if (unique.length === 0) return {};

  const entries = await Promise.all(
    unique.map(async (examId) => {
      const topicWhere = {
        deletedAt: null,
        subject: { deletedAt: null, section: { examId, deletedAt: null } },
      };
      const [total, completed] = await Promise.all([
        prisma.topic.count({ where: topicWhere }),
        prisma.userProgress.count({
          where: {
            userId,
            deletedAt: null,
            status: 'COMPLETED',
            topic: topicWhere,
          },
        }),
      ]);
      const pct = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
      return [examId, { completed, total, pct }] as const;
    }),
  );

  return Object.fromEntries(entries);
}
