'use client';

import { useAdminStats } from '@/components/super-admin/hooks/useSuperAdminPanel';
import { MarketingMetricsSection } from '@/components/super-admin/MarketingMetricsSection';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function AdminMarketingPage() {
  const { stats, isLoadingStats, statsLoadError } = useAdminStats();

  return (
    <div className="space-y-6">
      {statsLoadError ? (
        <Alert variant="destructive">
          <AlertDescription>{statsLoadError}</AlertDescription>
        </Alert>
      ) : null}
      <MarketingMetricsSection marketing={stats?.marketing} loading={isLoadingStats} />
    </div>
  );
}
