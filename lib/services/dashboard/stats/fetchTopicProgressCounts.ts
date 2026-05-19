import type { StatsDb, TopicProgressCounts } from '@/lib/services/dashboard/stats/types';

export async function fetchTopicProgressCounts(
  db: StatsDb,
  userId: string,
  examId: string,
): Promise<TopicProgressCounts> {
  const [topicsCount, subjectsCount, progressStats] = await Promise.all([
    db.topic.count({
      where: {
        subject: {
          section: { examId, deletedAt: null },
          deletedAt: null,
        },
        deletedAt: null,
      },
    }),
    db.subject.count({
      where: {
        section: { examId, deletedAt: null },
        deletedAt: null,
      },
    }),
    db.userProgress.groupBy({
      by: ['status'],
      where: {
        userId,
        topic: {
          subject: { section: { examId, deletedAt: null }, deletedAt: null },
          deletedAt: null,
        },
        deletedAt: null,
      },
      _count: true,
    }),
  ]);

  const completedTopics = progressStats.find((s) => s.status === 'COMPLETED')?._count || 0;
  const inProgressTopics = progressStats.find((s) => s.status === 'IN_PROGRESS')?._count || 0;
  const reviewedTopics = progressStats.find((s) => s.status === 'REVIEWED')?._count || 0;
  const notStartedTopics = topicsCount - (completedTopics + inProgressTopics + reviewedTopics);

  return {
    totalTopics: topicsCount,
    totalSubjects: subjectsCount,
    completedTopics,
    inProgressTopics,
    notStartedTopics,
    reviewedTopics,
  };
}
