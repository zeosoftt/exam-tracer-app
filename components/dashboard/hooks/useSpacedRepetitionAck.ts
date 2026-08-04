'use client';

import { useCallback, useState } from 'react';
import type { FetchStatsOptions } from '@/lib/client-api/dashboardClient';
import { patchTopicProgress } from '@/lib/client-api/progressClient';

type RefetchStats = (options?: FetchStatsOptions) => Promise<void>;

/** Dashboard ana sayfa — SRS onay akışı (useEvaluationTopicEditor'dan hafif). */
export function useSpacedRepetitionAck(fetchStats: RefetchStats) {
  const [reviewAckTopicId, setReviewAckTopicId] = useState<string | null>(null);

  const acknowledgeTopicReview = useCallback(
    async (topicId: string) => {
      setReviewAckTopicId(topicId);
      try {
        const { ok } = await patchTopicProgress(topicId, { reviewCompleted: true });
        if (ok) await fetchStats({ force: true, lite: false });
      } finally {
        setReviewAckTopicId(null);
      }
    },
    [fetchStats],
  );

  return { reviewAckTopicId, acknowledgeTopicReview };
}
