'use client';

import { useState, useEffect, useRef, useCallback, startTransition } from 'react';
import type { DashboardStats } from '../domain/dashboardTypes';
import { fetchDashboardStatsPayload, type FetchStatsOptions } from '@/lib/client-api/dashboardClient';
import { patchTopicProgress } from '@/lib/client-api/progressClient';
import { scheduleIdleTask } from '@/lib/runtime/scheduleIdleTask';

/**
 * @param initialStats Sunucuda (RSC) hesaplanmış tam kapsamlı istatistik. Verildiğinde
 * ilk core/full fetch'ler atlanır; yalnızca odak/görünürlük tazelemesi kalır.
 */
export function useDashboardStats(initialStats: DashboardStats | null = null) {
  const hasInitial = initialStats !== null;
  const [stats, setStats] = useState<DashboardStats | null>(initialStats);
  const [isLoading, setIsLoading] = useState(!hasInitial);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statsUpdatedAt, setStatsUpdatedAt] = useState<Date | null>(() =>
    hasInitial ? new Date() : null,
  );
  const [reviewAckTopicId, setReviewAckTopicId] = useState<string | null>(null);
  const initialFetchAt = hasInitial ? Date.now() : 0;
  const lastLiteStatsFetchAtRef = useRef(initialFetchAt);
  const lastFullStatsFetchAtRef = useRef(initialFetchAt);
  const statsFetchInFlightRef = useRef(false);
  const skipInitialFetchRef = useRef(hasInitial);

  const fetchStats = useCallback(async (options?: FetchStatsOptions) => {
    const lite = options?.lite ?? true;
    const now = Date.now();
    const lastFetchAt = lite ? lastLiteStatsFetchAtRef.current : lastFullStatsFetchAtRef.current;
    if (!options?.force && now - lastFetchAt < 10000) {
      return;
    }
    if (statsFetchInFlightRef.current) return;
    statsFetchInFlightRef.current = true;
    setLoadError(null);
    try {
      const data = await fetchDashboardStatsPayload(options);
      if (data !== undefined) {
        startTransition(() => {
          setStats((prev) => {
            if (!lite || !prev) return data;
            return {
              ...data,
              spacedRepetition:
                data.spacedRepetition?.items?.length || !prev.spacedRepetition
                  ? data.spacedRepetition
                  : prev.spacedRepetition,
              deneme:
                data.deneme?.recentAttempts?.length || !prev.deneme?.recentAttempts?.length
                  ? data.deneme
                  : prev.deneme ?? data.deneme,
              study:
                data.study?.weeklySummary?.some((day) => day.minutesStudied > 0) ||
                !prev.study?.weeklySummary?.some((day) => day.minutesStudied > 0)
                  ? data.study
                  : prev.study ?? data.study,
            };
          });
        });
        setStatsUpdatedAt(new Date());
        if (lite) {
          lastLiteStatsFetchAtRef.current = Date.now();
        } else {
          lastFullStatsFetchAtRef.current = Date.now();
        }
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setLoadError('İstatistikler yüklenemedi. Lütfen tekrar deneyin.');
    } finally {
      statsFetchInFlightRef.current = false;
      setIsLoading(false);
    }
  }, []);

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

  useEffect(() => {
    if (skipInitialFetchRef.current) {
      // Sunucu verisi tam kapsamlı; ilk yüklemede API'ye gitme.
      skipInitialFetchRef.current = false;
      return;
    }
    void fetchStats({ lite: true });
    scheduleIdleTask(
      () => {
        void fetchStats({ force: true, lite: false });
      },
      { timeout: 2500 },
    );
  }, [fetchStats]);

  useEffect(() => {
    const cleanups: Array<() => void> = [];

    scheduleIdleTask(
      () => {
        const handleFocus = () => {
          fetchStats({ lite: true });
        };
        const handleVisibilityChange = () => {
          if (!document.hidden) {
            fetchStats({ lite: true });
          }
        };
        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        cleanups.push(() => window.removeEventListener('focus', handleFocus));
        cleanups.push(() =>
          document.removeEventListener('visibilitychange', handleVisibilityChange),
        );
      },
      { timeout: 1500 },
    );

    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    loadError,
    statsUpdatedAt,
    fetchStats,
    reviewAckTopicId,
    acknowledgeTopicReview,
  };
}
