'use client';

import { BarChart3, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { FlashMessage } from '@/components/ui';
import { DenemeAnalysisStats } from '@/components/deneme/DenemeAnalysisStats';
import type { DenemeAnalysisView } from '@/components/deneme/DenemeAnalysisPanel';
import type { PrimaryTopicProgress } from '@/lib/client-api/denemeClient';

function TrendBadge({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
        <TrendingUp className="h-3.5 w-3.5" aria-hidden />
        Artış
      </span>
    );
  }
  if (trend === 'down') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
        <TrendingDown className="h-3.5 w-3.5" aria-hidden />
        Düşüş
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700 dark:bg-stone-800 dark:text-stone-200">
      <Minus className="h-3.5 w-3.5" aria-hidden />
      Benzer
    </span>
  );
}

function TopicProgressHeaderSummary({ progress }: { progress: PrimaryTopicProgress }) {
  return (
    <div className="min-w-0 text-right">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
        Konu tamamlama
      </p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-stone-900 dark:text-stone-100">
        {progress.completed} / {progress.total} konu
      </p>
    </div>
  );
}

type DenemeDashboardPanelProps = {
  analysis: DenemeAnalysisView | null;
  attemptsCount: number;
  primaryTopicProgress: PrimaryTopicProgress | null;
  listError: string | null;
  actionMessage: { type: 'success' | 'error'; text: string } | null;
  onRetryList: () => void;
};

export function DenemeDashboardPanel({
  analysis,
  attemptsCount,
  primaryTopicProgress,
  listError,
  actionMessage,
  onRetryList,
}: DenemeDashboardPanelProps) {
  const showTrend = analysis?.avgLast5 != null && analysis.avgPrev5 != null;

  return (
    <section
      className="mb-6 overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900/80"
      aria-labelledby="deneme-dashboard-heading"
    >
      <div className="flex flex-col gap-4 border-b border-stone-100 px-5 py-4 dark:border-stone-800 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-5">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800">
            <BarChart3 className="h-5 w-5 text-stone-600 dark:text-stone-300" aria-hidden />
          </div>
          <div>
            <h2
              id="deneme-dashboard-heading"
              className="font-display text-lg font-bold text-stone-900 dark:text-stone-100 sm:text-xl"
            >
              Deneme özeti
            </h2>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Net trendi ve istatistikler</p>
          </div>
        </div>

        <div className="ml-auto flex shrink-0 flex-col items-end gap-2">
          {primaryTopicProgress && primaryTopicProgress.total > 0 ? (
            <TopicProgressHeaderSummary progress={primaryTopicProgress} />
          ) : null}
          {showTrend && analysis ? <TrendBadge trend={analysis.trend} /> : null}
        </div>
      </div>

      {listError ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200 sm:px-6">
          <span>{listError}</span>
          <button
            type="button"
            onClick={onRetryList}
            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-red-50 dark:border-red-800 dark:bg-stone-900"
          >
            Tekrar dene
          </button>
        </div>
      ) : null}

      {actionMessage ? (
        <div className="border-b border-stone-100 px-5 py-3 dark:border-stone-800 sm:px-6">
          <FlashMessage type={actionMessage.type} variant="bordered">
            {actionMessage.text}
          </FlashMessage>
        </div>
      ) : null}

      <DenemeAnalysisStats analysis={analysis} attemptsCount={attemptsCount} />
    </section>
  );
}
