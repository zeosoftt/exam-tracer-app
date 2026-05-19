'use client';

import { useEffect, useMemo, useState, startTransition } from 'react';
import {
  loadDenemeFormBootstrap,
  fetchDenemeAttempts,
  type ExamTopicProgress,
  type PrimaryTopicProgress,
} from '@/lib/client-api/denemeClient';
import type { ExamOption } from '@/components/deneme/hooks/denemeFormTypes';

export function useDenemeExamBootstrap(featuresEnabled: boolean) {
  const [exams, setExams] = useState<ExamOption[]>([]);
  const [activeExamId, setActiveExamId] = useState<string | null>(null);

  useEffect(() => {
    if (!featuresEnabled) return;
    loadDenemeFormBootstrap()
      .then(({ exams: loadedExams, activeExamId: loadedActiveExamId }) => {
        startTransition(() => {
          setExams(loadedExams);
          if (loadedActiveExamId) setActiveExamId(loadedActiveExamId);
        });
      })
      .catch(() => {});
  }, [featuresEnabled]);

  const examIdsKey = useMemo(() => exams.map((e) => e.id).sort().join(','), [exams]);

  return { exams, activeExamId, examIdsKey };
}

export function useDenemeTopicProgressRefresh(
  featuresEnabled: boolean,
  examIdsKey: string,
  setTopicProgressByExam: React.Dispatch<React.SetStateAction<Record<string, ExamTopicProgress>>>,
  setPrimaryTopicProgress: React.Dispatch<React.SetStateAction<PrimaryTopicProgress | null>>,
) {
  useEffect(() => {
    if (!featuresEnabled || !examIdsKey) return;
    const ids = examIdsKey.split(',');
    let cancelled = false;
    fetchDenemeAttempts(1, ids)
      .then((result) => {
        if (cancelled || !result.ok) return;
        startTransition(() => {
          setTopicProgressByExam((prev) => ({ ...prev, ...result.topicProgressByExam }));
          if (result.primaryTopicProgress) {
            setPrimaryTopicProgress(result.primaryTopicProgress);
          }
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [featuresEnabled, examIdsKey, setTopicProgressByExam, setPrimaryTopicProgress]);
}
