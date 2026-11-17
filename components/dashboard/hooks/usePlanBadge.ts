'use client';

import { useState, useEffect } from 'react';
import type { PlanBadge } from '../domain/dashboardTypes';
import { fetchBillingPlanBadge, planCodeToBadge } from '@/lib/client-api/dashboardClient';
import { scheduleIdleTask } from '@/lib/runtime/scheduleIdleTask';

/**
 * Plan rozeti. Sunucudan `initialPlanCode` geldiyse ek istek atılmaz;
 * yalnızca eski akış (prop yok) için boşta /api/billing/plan çağrılır.
 */
export function usePlanBadge(initialPlanCode?: string | null) {
  const [planBadge, setPlanBadge] = useState<PlanBadge | null>(() =>
    initialPlanCode ? planCodeToBadge(initialPlanCode) : null,
  );
  const hasInitial = initialPlanCode !== undefined && initialPlanCode !== null;

  useEffect(() => {
    if (hasInitial) return;
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
  }, [hasInitial]);

  return planBadge;
}
