'use client';

import type { Dispatch, SetStateAction } from 'react';
import { BarChart3, CheckCircle, RefreshCw, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { EvaluationFilter } from '@/components/dashboard/domain/dashboardTypes';
import type { DetailEvaluationCounts } from '@/components/dashboard/detail/detailTopicEvaluation';

type EvaluationTopicFiltersProps = {
  evaluationFilter: EvaluationFilter;
  setEvaluationFilter: Dispatch<SetStateAction<EvaluationFilter>>;
  counts: DetailEvaluationCounts;
  filteredCount?: number;
  averageSuccessRate?: number;
  averageNet?: number;
  className?: string;
};

export function EvaluationTopicFilters({
  evaluationFilter,
  setEvaluationFilter,
  counts,
  filteredCount,
  averageSuccessRate,
  averageNet,
  className,
}: EvaluationTopicFiltersProps) {
  const showAverage = averageSuccessRate != null && averageNet != null;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Konu kategorisi filtresi">
          <button
            type="button"
            onClick={() => setEvaluationFilter((prev) => (prev === 'GOOD' ? null : 'GOOD'))}
            aria-pressed={evaluationFilter === 'GOOD'}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-success-400 focus:ring-offset-2 dark:focus:ring-offset-stone-950',
              evaluationFilter === 'GOOD'
                ? 'border-success-400 bg-success-50 text-success-800 dark:bg-success-950/40 dark:text-success-200'
                : 'border-success-200/80 bg-white text-stone-700 hover:border-success-300 hover:bg-success-50/50 dark:border-success-900/40 dark:bg-stone-950/50 dark:text-stone-200 dark:hover:border-success-700',
            )}
          >
            <CheckCircle className="h-4 w-4 shrink-0 text-success-600" aria-hidden />
            İyi
            <span className="rounded-md bg-white/80 px-1.5 py-0.5 text-xs font-bold tabular-nums dark:bg-stone-900/80">
              {counts.good}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setEvaluationFilter((prev) => (prev === 'IMPROVABLE' ? null : 'IMPROVABLE'))}
            aria-pressed={evaluationFilter === 'IMPROVABLE'}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 dark:focus:ring-offset-stone-950',
              evaluationFilter === 'IMPROVABLE'
                ? 'border-accent-400 bg-accent-50 text-accent-900 dark:bg-accent-950/40 dark:text-accent-200'
                : 'border-accent-200/80 bg-white text-stone-700 hover:border-accent-300 hover:bg-accent-50/50 dark:border-accent-900/40 dark:bg-stone-950/50 dark:text-stone-200 dark:hover:border-accent-700',
            )}
          >
            <TrendingUp className="h-4 w-4 shrink-0 text-accent-600" aria-hidden />
            Geliştirilebilir
            <span className="rounded-md bg-white/80 px-1.5 py-0.5 text-xs font-bold tabular-nums dark:bg-stone-900/80">
              {counts.improvable}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setEvaluationFilter((prev) => (prev === 'REPEAT' ? null : 'REPEAT'))}
            aria-pressed={evaluationFilter === 'REPEAT'}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-danger-400 focus:ring-offset-2 dark:focus:ring-offset-stone-950',
              evaluationFilter === 'REPEAT'
                ? 'border-danger-400 bg-danger-50 text-danger-800 dark:bg-danger-950/40 dark:text-danger-200'
                : 'border-danger-200/80 bg-white text-stone-700 hover:border-danger-300 hover:bg-danger-50/50 dark:border-danger-900/40 dark:bg-stone-950/50 dark:text-stone-200 dark:hover:border-danger-700',
            )}
          >
            <RefreshCw className="h-4 w-4 shrink-0 text-danger-600" aria-hidden />
            Tekrar
            <span className="rounded-md bg-white/80 px-1.5 py-0.5 text-xs font-bold tabular-nums dark:bg-stone-900/80">
              {counts.repeat}
            </span>
          </button>

          {evaluationFilter ? (
            <button
              type="button"
              onClick={() => setEvaluationFilter(null)}
              className="rounded-lg px-2 py-2 text-sm font-medium text-primary-700 underline decoration-primary-300 underline-offset-2 transition hover:text-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 dark:text-primary-400 dark:hover:text-primary-300 dark:focus:ring-offset-stone-950"
            >
              Filtreyi kaldır
            </button>
          ) : null}
        </div>

        {showAverage ? (
          <div className="inline-flex items-center gap-2 rounded-lg border border-primary-200/80 bg-white px-3 py-2 text-sm text-stone-700 dark:border-primary-900/40 dark:bg-stone-950/50 dark:text-stone-200 sm:ml-auto">
            <BarChart3 className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" aria-hidden />
            <span className="font-medium">Ortalama</span>
            <span className="font-bold tabular-nums text-primary-600 dark:text-primary-400">
              {(averageSuccessRate * 100).toFixed(1)}%
            </span>
            <span className="text-stone-400 dark:text-stone-500">·</span>
            <span className="text-xs text-stone-500 dark:text-stone-400">Net {averageNet.toFixed(2)}</span>
          </div>
        ) : null}
      </div>

      {evaluationFilter && filteredCount != null ? (
        <p className="text-sm text-stone-600 dark:text-stone-400">
          {evaluationFilter === 'GOOD' ? 'İyi' : evaluationFilter === 'IMPROVABLE' ? 'Geliştirilebilir' : 'Tekrar'} konuları
          gösteriliyor ({filteredCount} konu)
        </p>
      ) : null}
    </div>
  );
}
