import Link from 'next/link';
import { ArrowRight, Calendar, Clock, Lock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { getDenemeDetailPath } from '@/lib/client-api/denemeClient';
import type { DenemeAttemptDto } from '@/lib/deneme/denemeRepository';
import { formatDenemeDate } from '@/lib/deneme/computeDenemeAnalysis';
import {
  getNetTrendState,
  trendBadgeClass,
  trendNetBgClass,
  trendStripeClass,
} from '@/lib/deneme/netTrendStyles';
import { DenemeDeleteForm } from '@/components/deneme/DenemeDeleteForm';

type DenemeAttemptCardServerProps = {
  attempt: DenemeAttemptDto;
  avgNet: number | null;
  canViewDetail: boolean;
  featuresEnabled: boolean;
  topicPct?: number;
};

function StatChip({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string | number;
  tone?: 'neutral' | 'primary' | 'success' | 'danger' | 'muted';
}) {
  const tones = {
    neutral: 'border-stone-200 bg-stone-50 text-stone-800 dark:border-stone-700 dark:bg-stone-800/80 dark:text-stone-100',
    primary: 'border-primary-200 bg-primary-50 text-primary-800 dark:border-primary-900/50 dark:bg-primary-950/40 dark:text-primary-200',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200',
    danger: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200',
    muted: 'border-stone-200 bg-white text-stone-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300',
  };

  return (
    <div className={cn('rounded-lg border px-2.5 py-1.5 text-center', tones[tone])}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-400">{label}</p>
      <p className="mt-0.5 text-sm font-bold tabular-nums">{value}</p>
    </div>
  );
}

export function DenemeAttemptCardServer({
  attempt,
  avgNet,
  canViewDetail,
  featuresEnabled,
  topicPct,
}: DenemeAttemptCardServerProps) {
  const net = attempt.netScore != null ? Number(attempt.netScore) : null;
  const trend = net != null && avgNet != null ? getNetTrendState(net, avgNet) : null;
  const variant = trend?.variant ?? 'avg';
  const netDisplay = net != null ? (net % 1 === 0 ? String(net) : net.toFixed(2)) : '—';
  const hasStats =
    attempt.totalScore != null ||
    attempt.rightCount != null ||
    attempt.wrongCount != null ||
    attempt.emptyCount != null ||
    attempt.durationMinutes != null;

  return (
    <li
      className={cn(
        'overflow-hidden rounded-2xl border border-stone-200 border-l-[5px] bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900/90',
        trendStripeClass[variant],
      )}
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:gap-5 sm:p-5">
        <div
          className={cn(
            'flex shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br px-5 py-4 shadow-lg sm:w-[7.25rem]',
            trendNetBgClass[variant],
          )}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] opacity-90">Net</span>
          <span className="font-display text-4xl font-bold leading-none tabular-nums">{netDisplay}</span>
          {avgNet != null ? (
            <span className="mt-2 rounded-full bg-black/10 px-2 py-0.5 text-[10px] font-semibold tabular-nums">
              Ort. {avgNet.toFixed(1)}
            </span>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate font-display text-base font-bold text-stone-900 dark:text-stone-100">
                  {attempt.exam.name}
                </h3>
                <span className="shrink-0 rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                  {attempt.exam.code}
                </span>
                {topicPct != null && topicPct > 0 ? (
                  <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                    Konu %{topicPct}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-500 dark:text-stone-400">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-primary-600 dark:text-primary-400" />
                  {formatDenemeDate(attempt.attemptedAt)}
                </span>
                {attempt.durationMinutes != null ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {attempt.durationMinutes} dk
                  </span>
                ) : null}
              </div>
            </div>

            {trend && avgNet != null ? (
              <span
                className={cn(
                  'inline-flex min-w-[5.5rem] flex-col items-center rounded-2xl border px-3 py-2.5 text-center shadow-sm ring-1 ring-inset',
                  trendBadgeClass[trend.variant],
                )}
                title={`Genel ortalama: ${avgNet.toFixed(1)} net`}
              >
                <span className="text-xs font-bold leading-tight">{trend.label}</span>
                <span className="mt-0.5 text-[10px] font-semibold tabular-nums opacity-80">{trend.diffLabel}</span>
              </span>
            ) : null}
          </div>

          {hasStats ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
              {attempt.totalScore != null ? <StatChip label="Puan" value={attempt.totalScore} tone="primary" /> : null}
              {attempt.rightCount != null ? <StatChip label="Doğru" value={attempt.rightCount} tone="success" /> : null}
              {attempt.wrongCount != null ? <StatChip label="Yanlış" value={attempt.wrongCount} tone="danger" /> : null}
              {attempt.emptyCount != null ? <StatChip label="Boş" value={attempt.emptyCount} tone="muted" /> : null}
            </div>
          ) : null}

          {attempt.notes ? (
            <div className="rounded-xl border border-stone-100 bg-stone-50/80 px-3 py-2 text-xs leading-relaxed text-stone-600 dark:border-stone-800 dark:bg-stone-950/50 dark:text-stone-400">
              <span className="font-semibold text-stone-500">Not · </span>
              {attempt.notes}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-stone-100 pt-3 dark:border-stone-800">
            {canViewDetail ? (
              <Link
                href={getDenemeDetailPath(attempt.id)}
                className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-800 transition hover:border-primary-300 hover:bg-primary-100 dark:border-primary-900/50 dark:bg-primary-950/40 dark:text-primary-200"
              >
                Detay gör
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-semibold text-stone-500 dark:border-stone-700 dark:bg-stone-800/80 dark:text-stone-400">
                <Lock className="h-4 w-4" aria-hidden />
                Detay (Premium)
              </span>
            )}
            {featuresEnabled ? <DenemeDeleteForm attemptId={attempt.id} /> : null}
          </div>
        </div>
      </div>
    </li>
  );
}
