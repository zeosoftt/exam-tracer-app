'use client';

import { useState, useEffect } from 'react';
import type { PlanBadge } from '../domain/dashboardTypes';
import { fetchBillingPlanBadge } from '@/lib/client-api/dashboardClient';
import { scheduleIdleTask } from '@/lib/runtime/scheduleIdleTask';

export function usePlanBadge() {
  const [planBadge, setPlanBadge] = useState<PlanBadge | null>(null);

  useEffect(() => {
    let cancelled = false;
    scheduleIdleTask(
      () => {
        void (async () => {
          try {
            const badge = await fetchBillingPlanBadge();
            if (!cancelled && badge) {
              setPlanBadge(badge);
            }
          } catch {
            // plan rozeti opsiyonel
          }
        })();
      },
      { timeout: 1200 },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return planBadge;
}
