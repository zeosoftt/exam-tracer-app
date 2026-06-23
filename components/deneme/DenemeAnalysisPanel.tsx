'use client';

import { BarChart3, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { PrimaryTopicProgress } from '@/lib/client-api/denemeClient';
import { DenemeNetLineChart } from '@/components/deneme/DenemeNetLineChart';
import { denemeCardClass, TopicProgressRing } from '@/components/deneme/denemeUi';

function StatTile({
  label,
  value,
  sub,
  variant = 'default',
}: {
  label: string;
  value: string;
  sub?: string;
  variant?: 'default' | 'primary' | 'emerald' | 'amber';
}) {
  const styles = {
    default: 'border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800/60',
    primary: 'border-primary-200 bg-primary-50 dark:border-primary-900/40 dark:bg-primary-950/30',
    emerald: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/30',
    amber: 'border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30',
  };
  const labelStyles = {
    default: 'text-stone-500 dark:text-stone-400',
    primary: 'text-primary-700 dark:text-primary-300',
    emerald: 'text-emerald-700 dark:text-emerald-300',
    amber: 'text-amber-700 dark:text-amber-300',
  };
  const valueStyles = {
    default: 'text-stone-900 dark:text-stone-100',
    primary: 'text-primary-800 dark:text-primary-200',
    emerald: 'text-emerald-800 dark:text-emerald-200',
    amber: 'text-amber-800 dark:text-amber-200',
  };

  return (
    <div className={cn('rounded-xl border p-4', styles[variant])}>
      <p className={cn('text-xs font-medium uppercase tracking-wide', labelStyles[variant])}>{label}</p>
      <p className={cn('mt-1 text-2xl font-bold tabular-nums', valueStyles[variant])}>{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{sub}</p> : null}
    </div>
  );
}

function TrendPill({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
        <TrendingUp className="h-3.5 w-3.5" /> Artış
      </span>
    );
  }
  if (trend === 'down') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
        <TrendingDown className="h-3.5 w-3.5" /> Düşüş
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-medium text-stone-700 dark:bg-stone-700 dark:text-stone-200">
      <Minus className="h-3.5 w-3.5" /> Benzer
    </span>
  );
}

export type DenemeAnalysisView = {
  total: number;
  avg: number;
  max: number;
  min: number;
  avgLast5: number | null;
  avgPrev5: number | null;
  trend: 'up' | 'down' | 'stable';
  chartData: Array<{ attemptedAt: string; netScore: number; examName: string }>;
  chartMin: number;
  chartRange: number;
};

/** @deprecated DenemeDashboardPanel + DenemeAnalysisStats kullanın */
export function DenemeAnalysisPanel({
  analysis,
  primaryTopicProgress,
}: {
  analysis: DenemeAnalysisView;
  primaryTopicProgress: PrimaryTopicProgress | null;
}) {
  return (
    <section className={denemeCardClass}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-stone-900 dark:text-stone-100">
          <BarChart3 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          Deneme analizi
        </h2>
        {analysis.avgLast5 != null && analysis.avgPrev5 != null ? <TrendPill trend={analysis.trend} /> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {primaryTopicProgress && primaryTopicProgress.total > 0 ? (
          <div className="flex items-start gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/30 sm:col-span-2 lg:col-span-4">
            <TopicProgressRing progress={primaryTopicProgress} size="md" animate={false} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                Konu tamamlanma
              </p>
              <p className="mt-1 text-sm font-medium text-stone-700 dark:text-stone-200">
                {primaryTopicProgress.completed} / {primaryTopicProgress.total} konu
              </p>
              {primaryTopicProgress.examName ? (
                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-stone-500 dark:text-stone-400">
                  {primaryTopicProgress.examName}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
        <StatTile label="Toplam deneme" value={String(analysis.total)} variant="default" />
        <StatTile label="Ortalama net" value={analysis.avg.toFixed(2)} variant="primary" />
        <StatTile label="En yüksek net" value={analysis.max.toFixed(2)} variant="emerald" />
        <StatTile label="En düşük net" value={analysis.min.toFixed(2)} variant="amber" />
      </div>

      {analysis.avgLast5 != null && analysis.avgPrev5 != null ? (
        <p className="mt-4 text-sm text-stone-600 dark:text-stone-400">
          Son 5 deneme ort.{' '}
          <strong className="tabular-nums text-stone-900 dark:text-stone-100">{analysis.avgLast5.toFixed(2)}</strong>
          {' · '}
          önceki 5: <span className="tabular-nums">{analysis.avgPrev5.toFixed(2)}</span> net
        </p>
      ) : null}

      {analysis.chartData.length > 0 ? (
        <div className="mt-6 rounded-xl border border-stone-100 bg-stone-50 p-4 dark:border-stone-700 dark:bg-stone-800/60">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
              Net grafiği (son {analysis.chartData.length} deneme)
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Kesikli çizgi: genel ortalama ({analysis.avg.toFixed(1)} net)
            </p>
          </div>
          <DenemeNetLineChart
            data={analysis.chartData}
            chartMin={analysis.chartMin}
            chartRange={analysis.chartRange}
            avg={analysis.avg}
          />
        </div>
      ) : null}
    </section>
  );
}
