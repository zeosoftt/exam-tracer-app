'use client';

import { useState, useEffect, useRef, useCallback, startTransition } from 'react';
import { fetchPomodoroDashboard } from '@/lib/client-api/pomodoroClient';
import type { PomodoroStats } from '@/lib/client-api/pomodoroClient';
import type { PomodoroSession } from '@/components/pomodoro/pomodoroTypes';

export function usePomodoroDashboard() {
  const [history, setHistory] = useState<PomodoroSession[]>([]);
  const [stats, setStats] = useState<PomodoroStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const historyFetchInFlightRef = useRef(false);
  const lastHistoryFetchAtRef = useRef(0);

  const fetchHistory = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && now - lastHistoryFetchAtRef.current < 10000) return;
    if (historyFetchInFlightRef.current) return;
    historyFetchInFlightRef.current = true;
    try {
      const result = await fetchPomodoroDashboard();
      if (result.ok) {
        startTransition(() => {
          setHistory(result.sessions || []);
          setStats(result.stats || null);
        });
        lastHistoryFetchAtRef.current = Date.now();
      }
    } catch (error) {
      console.error('Failed to fetch pomodoro history:', error);
    } finally {
      historyFetchInFlightRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchHistory();
  }, [fetchHistory]);

  return { history, stats, isLoading, fetchHistory };
}
