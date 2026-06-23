'use client';

import Link from 'next/link';
import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import type { ExamTopicProgress, PrimaryTopicProgress } from '@/lib/client-api/denemeClient';
import { getDenemeDetailPath } from '@/lib/client-api/denemeClient';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Loader2,
  Lock,
  Minus,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';

/** Standart dashboard kartı */
export const denemeCardClass =
  'rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/80';

export function TopicProgressRing({
  progress,
  size = 'md',
  label,
  animate = true,
}: {
  progress: ExamTopicProgress;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  animate?: boolean;
}) {
  const r = size === 'lg' ? 44 : size === 'sm' ? 32 : 38;
  const stroke = size === 'lg' ? 8 : 6;
  const c = 2 * Math.PI * r;
  const dim = (r + stroke) * 2;
  const pct = progress.pct;
  const text = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-xl';

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg className="-rotate-90" width={dim} height={dim} aria-hidden>
          <circle
            cx={r + stroke}
            cy={r + stroke}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-stone-200 dark:text-stone-700"
          />
          <circle
            cx={r + stroke}
            cy={r + stroke}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct / 100)}
            className={cn(
              'text-primary-600 dark:text-primary-400',
              animate && 'transition-[stroke-dashoffset] duration-500',
            )}
          />
        </svg>
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center font-bold tabular-nums text-stone-900 dark:text-stone-100',
            text,
          )}
        >
          {pct}%
        </div>
      </div>
      {label ? (
        <span className="max-w-[7rem] text-center text-xs text-stone-500 dark:text-stone-400">{label}</span>
      ) : null}
    </div>
  );
}

export function TopicProgressChip({
  progress,
  compact,
}: {
  progress?: ExamTopicProgress;
  compact?: boolean;
}) {
  if (!progress || progress.total <= 0) return null;
  if (compact) {
    return (
      <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
        Konu %{progress.pct}
      </span>
    );
  }
  return (
    <span
      title={`${progress.completed} / ${progress.total} konu tamamlandı`}
      className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200"
    >
      <span className="font-bold tabular-nums">{progress.pct}%</span>
      <span className="tabular-nums text-emerald-700/90 dark:text-emerald-300/90">
        {progress.completed}/{progress.total} konu
      </span>
    </span>
  );
}

type NetTrendState = {
  variant: 'up' | 'down' | 'avg';
  diff: number;
  label: string;
  diffLabel: string;
};

function getNetTrendState(net: number, avgNet: number): NetTrendState {
  const diff = net - avgNet;
  const threshold = 1.5;

  if (diff >= threshold) {
    return {
      variant: 'up',
      diff,
      label: 'Yükseliş',
      diffLabel: `+${diff.toFixed(1)} net`,
    };
  }

  if (diff <= -threshold) {
    return {
      variant: 'down',
      diff,
      label: 'Düşüş',
      diffLabel: `${diff.toFixed(1)} net`,
    };
  }

  return {
    variant: 'avg',
    diff,
    label: 'Ortalama',
    diffLabel: diff >= 0 ? `+${diff.toFixed(1)} net` : `${diff.toFixed(1)} net`,
  };
}

const trendAccentStyles = {
  up: {
    stripe: 'border-l-emerald-500',
    netBg: 'from-emerald-500 to-emerald-600 text-white shadow-emerald-500/25',
    badge:
      'border-emerald-300 bg-emerald-50 text-emerald-800 ring-emerald-600/20 dark:border-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-100 dark:ring-emerald-400/25',
    icon: TrendingUp,
  },
  down: {
    stripe: 'border-l-red-500',
    netBg: 'from-red-500 to-red-600 text-white shadow-red-500/25',
    badge:
      'border-red-300 bg-red-50 text-red-800 ring-red-600/20 dark:border-red-700 dark:bg-red-950/80 dark:text-red-100 dark:ring-red-400/25',
    icon: TrendingDown,
  },
  avg: {
    stripe: 'border-l-amber-400',
    netBg: 'from-amber-400 to-amber-500 text-amber-950 shadow-amber-400/25',
    badge:
      'border-amber-300 bg-amber-50 text-amber-900 ring-amber-600/20 dark:border-amber-700 dark:bg-amber-950/80 dark:text-amber-100 dark:ring-amber-400/25',
    icon: Minus,
  },
} as const;

function NetVsAvgIndicator({
  net,
  avgNet,
  prominent = false,
}: {
  net: number;
  avgNet: number;
  prominent?: boolean;
}) {
  const trend = getNetTrendState(net, avgNet);
  const styles = trendAccentStyles[trend.variant];
  const Icon = styles.icon;

  if (prominent) {
    return (
      <div
        className={cn(
          'flex min-w-[5.5rem] flex-col items-center rounded-2xl border px-3 py-2.5 text-center shadow-sm ring-1 ring-inset',
          styles.badge,
        )}
        title={`Genel ortalama: ${avgNet.toFixed(1)} net`}
      >
        <Icon className="h-5 w-5 shrink-0" aria-hidden />
        <span className="mt-1 text-xs font-bold leading-tight">{trend.label}</span>
        <span className="mt-0.5 text-[10px] font-semibold tabular-nums opacity-80">{trend.diffLabel}</span>
      </div>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold shadow-sm ring-1 ring-inset',
        styles.badge,
      )}
      title={`Genel ortalama: ${avgNet.toFixed(1)} net · ${trend.diffLabel.replace(' net', '')} fark`}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {trend.label}
    </span>
  );
}

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
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-0.5 text-sm font-bold tabular-nums">{value}</p>
    </div>
  );
}

export function DenemeAttemptCard({
  attempt,
  topicProgress,
  avgNet,
  formatDate,
  canViewDetail = true,
  onDelete,
  deleting = false,
}: {
  attempt: {
    id: string;
    examId: string;
    exam: { name: string; code: string };
    attemptedAt: string;
    totalScore: number | null;
    netScore: number | null;
    rightCount: number | null;
    wrongCount: number | null;
    emptyCount: number | null;
    durationMinutes: number | null;
    notes: string | null;
  };
  topicProgress?: ExamTopicProgress;
  avgNet: number | null;
  formatDate: (s: string) => string;
  canViewDetail?: boolean;
  onDelete?: (attemptId: string) => void;
  deleting?: boolean;
}) {
  const net = attempt.netScore != null ? Number(attempt.netScore) : null;
  const trend = net != null && avgNet != null ? getNetTrendState(net, avgNet) : null;
  const accent = trend ? trendAccentStyles[trend.variant] : trendAccentStyles.avg;
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
        'group overflow-hidden rounded-2xl border border-stone-200 border-l-[5px] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-stone-800 dark:bg-stone-900/90',
        accent.stripe,
      )}
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:gap-5 sm:p-5">
        <div
          className={cn(
            'flex shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br px-5 py-4 shadow-lg sm:w-[7.25rem]',
            accent.netBg,
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
                <TopicProgressChip progress={topicProgress} compact />
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-500 dark:text-stone-400">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-primary-600 dark:text-primary-400" />
                  {formatDate(attempt.attemptedAt)}
                </span>
                {attempt.durationMinutes != null ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {attempt.durationMinutes} dk
                  </span>
                ) : null}
              </div>
            </div>

            {net != null && avgNet != null ? (
              <NetVsAvgIndicator net={net} avgNet={avgNet} prominent />
            ) : null}
          </div>

          {hasStats ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
              {attempt.totalScore != null ? (
                <StatChip label="Puan" value={attempt.totalScore} tone="primary" />
              ) : null}
              {attempt.rightCount != null ? (
                <StatChip label="Doğru" value={attempt.rightCount} tone="success" />
              ) : null}
              {attempt.wrongCount != null ? (
                <StatChip label="Yanlış" value={attempt.wrongCount} tone="danger" />
              ) : null}
              {attempt.emptyCount != null ? (
                <StatChip label="Boş" value={attempt.emptyCount} tone="muted" />
              ) : null}
            </div>
          ) : null}

          {attempt.notes ? (
            <div className="rounded-xl border border-stone-100 bg-stone-50/80 px-3 py-2 text-xs leading-relaxed text-stone-600 dark:border-stone-800 dark:bg-stone-950/50 dark:text-stone-400">
              <span className="font-semibold text-stone-500 dark:text-stone-500">Not · </span>
              {attempt.notes}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-stone-100 pt-3 dark:border-stone-800">
            {canViewDetail ? (
              <Link
                href={getDenemeDetailPath(attempt.id)}
                className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-800 transition hover:border-primary-300 hover:bg-primary-100 dark:border-primary-900/50 dark:bg-primary-950/40 dark:text-primary-200 dark:hover:border-primary-800 dark:hover:bg-primary-950/60"
              >
                Detay gör
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            ) : (
              <span
                className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-semibold text-stone-500 dark:border-stone-700 dark:bg-stone-800/80 dark:text-stone-400"
                title="Deneme detayı ve konu analizi Premium plan özelliğidir."
              >
                <Lock className="h-4 w-4" aria-hidden />
                Detay (Premium)
              </span>
            )}
            {onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(attempt.id)}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300 dark:hover:border-red-800 dark:hover:bg-red-950/50"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden />
                )}
                Denemeyi sil
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
}

export function DenemeTopicOnlyHero({ progress }: { progress: PrimaryTopicProgress }) {
  return (
    <section className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-6 dark:border-emerald-900/40 dark:bg-emerald-950/30">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Konu ilerlemen</h2>
          <p className="mt-1 text-lg font-bold text-stone-900 dark:text-stone-100">
            {progress.examName ?? 'Aktif sınav'}
          </p>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            {progress.completed} / {progress.total} konu tamamlandı
          </p>
        </div>
        <TopicProgressRing progress={progress} size="lg" />
      </div>
    </section>
  );
}

export function DenemeEmptyState({
  featuresEnabled,
  onAdd,
}: {
  featuresEnabled: boolean;
  onAdd?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12 text-center dark:border-stone-600 dark:bg-stone-900/80">
      <Target className="mx-auto h-10 w-10 text-stone-300 dark:text-stone-600" />
      <p className="mt-4 font-medium text-stone-700 dark:text-stone-300">Henüz deneme kaydı yok</p>
      <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
        {featuresEnabled
          ? 'İlk denemenizi ekleyerek net trendinizi takip etmeye başlayın.'
          : 'Yeni kayıt ekleme şu an kapalı.'}
      </p>
      {featuresEnabled && onAdd ? (
        <button type="button" onClick={onAdd} className="btn btn-primary mt-6 gap-2">
          <Target className="h-4 w-4" />
          Deneme ekle
        </button>
      ) : null}
    </div>
  );
}

export function FormCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg p-2 text-stone-500 transition hover:bg-stone-100 hover:text-stone-800 dark:hover:bg-stone-800 dark:hover:text-stone-200"
      aria-label="Formu kapat"
    >
      <X className="h-5 w-5" />
    </button>
  );
}

export function DenemeFormModal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 dark:bg-black/70"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[min(90vh,52rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl dark:border-stone-700 dark:bg-stone-900"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="deneme-form-modal-title"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-stone-200 px-5 py-4 dark:border-stone-700">
          <h2
            id="deneme-form-modal-title"
            className="flex items-center gap-2 text-lg font-bold text-stone-900 dark:text-stone-100"
          >
            <BookOpen className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            {title}
          </h2>
          <FormCloseButton onClick={onClose} />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5">{children}</div>
      </div>
    </div>
  );
}
