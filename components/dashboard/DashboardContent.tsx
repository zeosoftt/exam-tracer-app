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
import { DashboardEvaluationSection } from '@/components/dashboard/home/DashboardEvaluationSection';
import { DashboardQuickLinksSection } from '@/components/dashboard/home/DashboardQuickLinksSection';

export function DashboardContent({ user }: { user: DashboardUser }) {
  const page = useDashboardPage(user);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <DashboardHeader
        user={page.user}
        planBadge={page.planBadge}
        statsRefreshing={page.statsRefreshing}
        isLoading={page.isLoading}
        onRefresh={() => void page.refreshDashboard()}
      />

      <main className="mx-auto max-w-5xl px-4 py-8 pb-24 sm:px-6 sm:py-10 sm:pb-12 lg:px-8">
        <DashboardHeroSection
          todayLabel={page.vm.todayLabel}
          firstName={page.vm.firstName}
          statsUpdatedAt={page.statsUpdatedAt}
          isLoading={page.isLoading}
          stats={page.stats}
          srsOverdue={page.srsOverdue}
          srsDueWeek={page.srsDueWeek}
        />

        <DashboardStatsGrid isLoading={page.isLoading} stats={page.stats} vm={page.vm} />

        {!page.isLoading && page.stats?.spacedRepetition && (
          <DashboardSpacedRepetitionSection
            spacedRepetition={page.stats.spacedRepetition}
            reviewAckTopicId={page.reviewAckTopicId}
            onAcknowledgeReview={page.acknowledgeTopicReview}
          />
        )}

        {page.stats?.evaluation && (
          <DashboardEvaluationSection
            evaluation={page.stats.evaluation}
            vm={page.vm}
            evaluationFilter={page.evaluationFilter}
            setEvaluationFilter={page.setEvaluationFilter}
            editingTopicId={page.editingTopicId}
            editValues={page.editValues}
            setEditValues={page.setEditValues}
            expandedSections={page.expandedSections}
            toggleSection={page.toggleSection}
            startEdit={page.startEdit}
            cancelEdit={page.cancelEdit}
            updateQuestionStats={page.updateQuestionStats}
          />
        )}

        <DashboardQuickLinksSection />
      </main>
    </div>
  );
}
