'use client';

import { useAdminStats } from '@/components/super-admin/hooks/useSuperAdminPanel';
import { MarketingMetricsSection } from '@/components/super-admin/MarketingMetricsSection';
import { AdminPageHeader } from '@/components/super-admin/layout/AdminPageHeader';
import { AdminErrorAlert } from '@/components/super-admin/layout/AdminErrorAlert';
import { ADMIN_NAV_ITEMS } from '@/components/super-admin/layout/adminNav';

const nav = ADMIN_NAV_ITEMS.find((i) => i.href.endsWith('/marketing'));

export function AdminMarketingPage() {
  const { stats, isLoadingStats, statsLoadError, reloadStats } = useAdminStats();

  return (
    <div className="space-y-6">
      <AdminPageHeader title={nav?.title ?? 'Pazarlama'} description={nav?.description} />

      {statsLoadError ? (
        <AdminErrorAlert
          message={statsLoadError}
          onRetry={() => void reloadStats()}
          retrying={isLoadingStats}
        />
      ) : null}

      <MarketingMetricsSection marketing={stats?.marketing} loading={isLoadingStats} />
    </div>
  );
}
