'use client';

import { useState, useEffect, useRef, useCallback, startTransition } from 'react';
import type { DashboardStats } from '../domain/dashboardTypes';
import { fetchDashboardStatsPayload, type FetchStatsOptions } from '@/lib/client-api/dashboardClient';

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statsUpdatedAt, setStatsUpdatedAt] = useState<Date | null>(null);
  const lastLiteStatsFetchAtRef = useRef(0);
  const lastFullStatsFetchAtRef = useRef(0);
  const statsFetchInFlightRef = useRef(false);

  const fetchStats = useCallback(async (options?: FetchStatsOptions) => {
    const lite = options?.lite ?? true;
    const now = Date.now();
    const lastFetchAt = lite ? lastLiteStatsFetchAtRef.current : lastFullStatsFetchAtRef.current;
    if (!options?.force && now - lastFetchAt < 10000) {
      return;
    }
    if (statsFetchInFlightRef.current) return;
    statsFetchInFlightRef.current = true;
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
    } finally {
      statsFetchInFlightRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchStats({ lite: true });
      void fetchStats({ force: true, lite: false });
    };
    void load();
  }, [fetchStats]);

  useEffect(() => {
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
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    statsUpdatedAt,
    fetchStats,
  };
}
