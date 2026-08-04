/**
 * Dashboard Detail Content Component
 * Tab yapısı ile bölüm ve ders ilerlemesi
 */

'use client';

import { useDashboardDetailPage } from '@/components/dashboard/hooks/useDashboardDetailPage';
import type { DashboardUser } from '@/components/dashboard/home/dashboardHomeTypes';
import { DashboardDetailHeader } from '@/components/dashboard/detail/DashboardDetailHeader';
import { BackLink, FlashMessage } from '@/components/ui';
import { DashboardDetailSectionsView } from '@/components/dashboard/detail/DashboardDetailSectionsView';
import { DashboardDetailEmptyState } from '@/components/dashboard/detail/DashboardDetailEmptyState';

export function DashboardDetailContent({ user }: { user: DashboardUser }) {
  const page = useDashboardDetailPage();

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <DashboardDetailHeader user={user} />

      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-6 sm:py-12">
        <BackLink href="/dashboard" label="Özet Ekrana Dön" />

        {page.actionMessage ? (
          <div className="mb-4">
            <FlashMessage type={page.actionMessage.type} variant="bordered">
              {page.actionMessage.text}
            </FlashMessage>
          </div>
        ) : null}

        {!page.isLoading && page.fetchError ? (
          <FlashMessage type="error" variant="bordered">
            {page.fetchError} Sayfayı yenileyin; sorun devam ederse destek ile iletişime geçin.
          </FlashMessage>
        ) : null}

        {!page.isLoading && !page.fetchError && page.detailData?.sections && page.detailData.sections.length > 0 && (
          <DashboardDetailSectionsView {...page} />
        )}

        {!page.isLoading &&
          !page.fetchError &&
          (!page.detailData?.exam || page.detailData.sections.length === 0) && (
          <DashboardDetailEmptyState />
        )}
      </main>
    </div>
  );
}
