'use client';

import { cn } from '@/lib/utils/cn';
import { DenemeNetLineChart } from '@/components/deneme/DenemeNetLineChart';
import type { DenemeAnalysisView } from '@/components/deneme/DenemeAnalysisPanel';

function formatNet(value: number) {
  return value.toFixed(2);
}

function MetricChip({ label, value, variant = 'default' }: { label: string; value: string; variant?: 'min' | 'max' | 'default' }) {
  const styles = {
    min: {
      box: 'border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30',
      label: 'text-amber-700 dark:text-amber-300',
      value: 'text-amber-800 dark:text-amber-200',
    },
    max: {
      box: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/30',
      label: 'text-emerald-700 dark:text-emerald-300',
      value: 'text-emerald-800 dark:text-emerald-200',
    },
    default: {
      box: 'border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-950/50',
      label: 'text-stone-500 dark:text-stone-400',
      value: 'text-stone-900 dark:text-stone-50',
    },
  }[variant];

  return (
    <div className={cn('rounded-lg border px-3 py-2.5', styles.box)}>
      <p className={cn('text-[11px] font-semibold uppercase tracking-wide', styles.label)}>{label}</p>
      <p className={cn('mt-0.5 font-display text-lg font-bold tabular-nums', styles.value)}>{value}</p>
    </div>
  );
}

function DenemeStatsSummary({
  analysis,
  attemptsCount,
}: {
  analysis: DenemeAnalysisView | null;
  attemptsCount: number;
}) {
  const total = analysis?.total ?? attemptsCount;
  const hasNetData = Boolean(analysis && analysis.total > 0);

  if (!hasNetData) {
    return (
      <div className="px-5 py-6 sm:px-6">
        <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/60 px-5 py-8 text-center dark:border-stone-600 dark:bg-stone-900/40">
          <p className="text-sm font-medium text-stone-700 dark:text-stone-300">Henüz net verisi yok</p>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            {total > 0 ? `${total} kayıt var; net girilince özet burada görünür.` : 'İlk deneme kaydınızı ekleyin.'}
          </p>
        </div>
      </div>
    );
  }

  const avgLabel = formatNet(analysis!.avg);
  const recentLine =
    analysis!.avgLast5 != null && analysis!.avgPrev5 != null
      ? `Son 5 ort. ${formatNet(analysis!.avgLast5)} · önceki 5: ${formatNet(analysis!.avgPrev5)}`
      : null;

  return (
    <div className="px-5 py-5 sm:px-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-5 dark:border-stone-700 dark:bg-stone-900/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
            Ortalama net
          </p>
          <p className="mt-1 font-display text-4xl font-bold tabular-nums tracking-tight text-stone-900 dark:text-stone-50 sm:text-[2.75rem]">
            {avgLabel}
          </p>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            <span className="font-semibold tabular-nums text-stone-900 dark:text-stone-100">{total}</span> deneme
            {' · '}
            tüm kayıtlar
          </p>
          {recentLine ? (
            <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">{recentLine}</p>
          ) : null}
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-950/30">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
              Net aralığı
            </p>
          
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <MetricChip label="En düşük" value={formatNet(analysis!.min)} variant="min" />
            <MetricChip label="En yüksek" value={formatNet(analysis!.max)} variant="max" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DenemeAnalysisStats({
  analysis,
  attemptsCount,
}: {
  analysis: DenemeAnalysisView | null;
  attemptsCount: number;
}) {
  return (
    <>
      <DenemeStatsSummary analysis={analysis} attemptsCount={attemptsCount} />

      {analysis && analysis.chartData.length > 0 ? (
        <div className="border-t border-stone-100 px-5 py-4 dark:border-stone-800 sm:px-6 sm:py-5">
          <p className="mb-3 text-sm font-medium text-stone-700 dark:text-stone-300">
            Net grafiği (son {analysis.chartData.length} deneme)
          </p>
          <div
            className={cn(
              'rounded-xl border border-stone-200 bg-stone-50/80 p-4 dark:border-stone-700 dark:bg-stone-900/40',
            )}
          >
            <DenemeNetLineChart
              data={analysis.chartData}
              chartMin={analysis.chartMin}
              chartRange={analysis.chartRange}
              avg={analysis.avg}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
