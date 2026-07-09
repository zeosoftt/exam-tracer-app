/**
 * Dashboard Content Component
 * Ana sayfa bölümlerini home/* alt bileşenlerine ayırır.
 */

'use client';

import { useDashboardPage } from '@/components/dashboard/hooks/useDashboardPage';
import type { DashboardUser } from '@/components/dashboard/home/dashboardHomeTypes';
import { DashboardHeader } from '@/components/dashboard/home/DashboardHeader';
import { DashboardHeroSection } from '@/components/dashboard/home/DashboardHeroSection';
import { DashboardStatsGrid } from '@/components/dashboard/home/DashboardStatsGrid';
import { DashboardSpacedRepetitionSection } from '@/components/dashboard/home/DashboardSpacedRepetitionSection';
import { ParentChildrenPanel } from '@/components/dashboard/parent/ParentChildrenPanel';

export function DashboardContent({
  user,
  showParentChildrenPanel = false,
}: {
  user: DashboardUser;
  showParentChildrenPanel?: boolean;
}) {
  const page = useDashboardPage(user);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <DashboardHeader user={page.user} planBadge={page.planBadge} />

      <main className="mx-auto max-w-5xl px-4 py-8 pb-24 sm:px-6 sm:py-10 sm:pb-12 lg:px-8">
        <DashboardHeroSection
          todayLabel={page.vm.todayLabel}
          firstName={page.vm.firstName}
          statsUpdatedAt={page.statsUpdatedAt}
          isLoading={page.isLoading}
          stats={page.stats}
          srsOverdue={page.srsOverdue}
        />

        {showParentChildrenPanel ? <ParentChildrenPanel /> : null}

        <DashboardStatsGrid
          isLoading={page.isLoading}
          loadError={page.loadError}
          stats={page.stats}
          vm={page.vm}
          onRetry={() => void page.fetchStats({ force: true, lite: false })}
        />

        {!page.isLoading && page.stats?.spacedRepetition && (
          <DashboardSpacedRepetitionSection
            spacedRepetition={page.stats.spacedRepetition}
            reviewAckTopicId={page.reviewAckTopicId}
            onAcknowledgeReview={page.acknowledgeTopicReview}
          />
        )}

      </main>
    </div>
  );
}
