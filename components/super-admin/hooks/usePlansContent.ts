'use client';

import { useState, useEffect, useCallback, startTransition } from 'react';
import type { PlanStat } from '../domain/superAdminTypes';
import { fetchSuperAdminPlanStats } from '../api/superAdminClient';
import { scheduleIdleTask } from '@/lib/runtime/scheduleIdleTask';

export function usePlansContent() {
  const [planStats, setPlanStats] = useState<PlanStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await fetchSuperAdminPlanStats();
      if (result.ok) {
        startTransition(() => setPlanStats(result.planStats));
      } else {
        setError(result.message);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Plan verileri yüklenemedi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    scheduleIdleTask(
      () => {
        void load();
      },
      { timeout: 900 },
    );
  }, [load]);

  return { planStats, loading, error, reload: load };
}
