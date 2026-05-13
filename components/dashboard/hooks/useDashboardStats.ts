'use client';

import { useState, useEffect, useRef, useCallback, startTransition } from 'react';
import type { DashboardStats } from '../domain/dashboardTypes';
import { fetchDashboardStatsPayload, type FetchStatsOptions } from '../api/fetchDashboardData';
import { scheduleIdleTask } from '@/lib/runtime/scheduleIdleTask';

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statsRefreshing, setStatsRefreshing] = useState(false);
  const [statsUpdatedAt, setStatsUpdatedAt] = useState<Date | null>(null);
  const lastLiteStatsFetchAtRef = useRef(0);
  const lastFullStatsFetchAtRef = useRef(0);
  const statsFetchInFlightRef = useRef(false);

  const fetchStats = useCallback(async (options?: FetchStatsOptions) => {
    const lite = options?.lite ?? true;
    const now = Date.now();
    const lastFetchAt = lite ? lastLiteStatsFetchAtRef.current : lastFullStatsFetchAtRef.current;
    if (!options?.force && !options?.manual && now - lastFetchAt < 10000) {
      return;
    }
    if (statsFetchInFlightRef.current) return;
    statsFetchInFlightRef.current = true;
    if (options?.manual) setStatsRefreshing(true);
    try {
      const data = await fetchDashboardStatsPayload(options);
      if (data !== undefined) {
        startTransition(() => {
          setStats((prev) => {
            if (lite && prev?.evaluation && !data.evaluation) {
              return { ...data, evaluation: prev.evaluation };
            }
            return data;
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
      if (options?.manual) setStatsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchStats({ lite: true });
      // Ağır "full" istatistik paketini ilk boyama sonrası / boşta çalıştır — TBT azaltır
      scheduleIdleTask(
        () => {
          void fetchStats({ force: true, lite: false });
        },
        { timeout: 1800 },
      );
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
    statsRefreshing,
    statsUpdatedAt,
    fetchStats,
  };
}
