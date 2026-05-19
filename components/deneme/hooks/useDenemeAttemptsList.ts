'use client';

import { useCallback, useEffect, useRef, useState, startTransition } from 'react';
import {
  fetchDenemeAttempts,
  type DenemeAttemptListItem,
  type ExamTopicProgress,
  type PrimaryTopicProgress,
} from '@/lib/client-api/denemeClient';

export function useDenemeAttemptsList(onFeatureDisabled?: () => void) {
  const [attempts, setAttempts] = useState<DenemeAttemptListItem[]>([]);
  const [topicProgressByExam, setTopicProgressByExam] = useState<Record<string, ExamTopicProgress>>({});
  const [primaryTopicProgress, setPrimaryTopicProgress] = useState<PrimaryTopicProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [denemePremiumRequired, setDenemePremiumRequired] = useState(false);

  const attemptsFetchInFlightRef = useRef(false);
  const lastAttemptsFetchAtRef = useRef(0);

  const fetchAttempts = useCallback(
    async (force = false) => {
      const now = Date.now();
      if (!force && now - lastAttemptsFetchAtRef.current < 10000) return;
      if (attemptsFetchInFlightRef.current) return;
      attemptsFetchInFlightRef.current = true;
      if (force) {
      setListError(null);
      setLoading(true);
    }

      try {
        const result = await fetchDenemeAttempts(50);
        if (result.ok) {
          startTransition(() => {
            setAttempts(result.data);
            setTopicProgressByExam(result.topicProgressByExam);
            setPrimaryTopicProgress(result.primaryTopicProgress);
            setListError(null);
            setDenemePremiumRequired(false);
          });
          lastAttemptsFetchAtRef.current = Date.now();
        } else if (result.premiumRequired) {
          startTransition(() => {
            setDenemePremiumRequired(true);
            setAttempts([]);
            setListError(null);
          });
          setLoading(false);
        } else if (result.featureDisabled) {
          onFeatureDisabled?.();
          startTransition(() => {
            setDenemePremiumRequired(false);
            setListError(null);
          });
          setLoading(false);
        } else {
          startTransition(() => setListError(result.error));
        }
      } catch {
        startTransition(() => setListError('Deneme kayıtları yüklenemedi.'));
      } finally {
        attemptsFetchInFlightRef.current = false;
        setLoading(false);
      }
    },
    [onFeatureDisabled],
  );

  useEffect(() => {
    fetchAttempts();
  }, [fetchAttempts]);

  return {
    attempts,
    topicProgressByExam,
    primaryTopicProgress,
    setTopicProgressByExam,
    setPrimaryTopicProgress,
    loading,
    listError,
    denemePremiumRequired,
    fetchAttempts,
  };
}
