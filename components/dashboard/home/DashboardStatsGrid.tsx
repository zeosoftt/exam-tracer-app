'use client';

import Link from 'next/link';
import {
  CheckCircle,
  Circle,
  ClipboardList,
  Clock,
  LayoutDashboard,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { WEEK_DAY_LABELS } from '@/components/dashboard/domain/dashboardConstants';
import type { DashboardStats } from '@/components/dashboard/domain/dashboardTypes';
import type { useDashboardViewModel } from '@/components/dashboard/hooks/useDashboardViewModel';

type DashboardViewModel = ReturnType<typeof useDashboardViewModel>;

type DashboardStatsGridProps = {
  isLoading: boolean;
  loadError?: string | null;
  stats: DashboardStats | null;
  vm: DashboardViewModel;
  onRetry?: () => void;
};

function StatsPanelSkeleton() {
  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900/80 sm:mb-10">
      <div className="border-b border-stone-100 px-5 py-4 dark:border-stone-800 sm:px-6">
        <div className="h-6 w-36 animate-pulse rounded bg-stone-200 dark:bg-stone-700" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={cn(
              'animate-pulse border-stone-100 p-5 dark:border-stone-800 sm:p-6',
              i > 0 && 'border-t sm:border-t-0 sm:border-l',
              i >= 2 && 'lg:border-t-0',
            )}
          >
            <div className="h-3 w-20 rounded bg-stone-100 dark:bg-stone-800" />
            <div className="mt-3 h-9 w-16 rounded bg-stone-200 dark:bg-stone-700" />
            <div className="mt-4 h-3 w-full max-w-[85%] rounded bg-stone-100 dark:bg-stone-800" />
          </div>
        ))}
      </div>
    </section>
  );
}

function PanelCell({
  children,
  className,
  href,
  ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  href: string;
  ariaLabel: string;
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(
        'group flex h-full flex-col p-5 transition-colors hover:bg-stone-50 dark:hover:bg-stone-900/60 sm:p-6',
        className,
      )}
    >
      {children}
    </Link>
  );
}

function CellLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
      <span className="text-stone-400 dark:text-stone-500">{icon}</span>
      {children}
    </div>
  );
}

function TopicProgressSummary({
  completed,
  inProgress,
  notStarted,
  totalTopics,
  totalSubjects,
  completionRate,
}: {
  completed: number;
  inProgress: number;
  notStarted: number;
  totalTopics: number;
  totalSubjects: number;
  completionRate: number;
}) {
  const safeTotal = Math.max(totalTopics, completed + inProgress + notStarted, 1);
  const completedWidth = (completed / safeTotal) * 100;
  const inProgressWidth = (inProgress / safeTotal) * 100;
  const notStartedWidth = (notStarted / safeTotal) * 100;

  const rows = [
    {
      label: 'Tamamlanan',
      value: completed,
      dotClass: 'bg-primary-500 dark:bg-primary-400',
    },
    {
      label: 'Devam eden',
      value: inProgress,
      dotClass: 'bg-accent-500 dark:bg-accent-400',
    },
    {
      label: 'Başlanmamış',
      value: notStarted,
      dotClass: 'bg-stone-300 dark:bg-stone-600',
    },
  ] as const;

  if (totalTopics <= 0) {
    return (
      <>
        <p className="font-display text-2xl font-bold text-stone-300 dark:text-stone-600">—</p>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">Henüz takip edilen konu yok.</p>
      </>
    );
  }

  return (
    <>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-display text-3xl font-bold tabular-nums tracking-tight text-stone-900 dark:text-stone-50">
            {completionRate}
            <span className="text-xl text-stone-400 dark:text-stone-500">%</span>
          </p>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">tamamlanma oranı</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold tabular-nums text-stone-900 dark:text-stone-100">
            {completed} / {totalTopics}
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400">konu bitti</p>
        </div>
      </div>

      <div
        className="mt-4 flex h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800"
        role="img"
        aria-label={`Tamamlanan ${completed}, devam eden ${inProgress}, başlanmamış ${notStarted}`}
      >
        {completedWidth > 0 ? (
          <div className="h-full bg-primary-500 dark:bg-primary-400" style={{ width: `${completedWidth}%` }} />
        ) : null}
        {inProgressWidth > 0 ? (
          <div className="h-full bg-accent-500 dark:bg-accent-400" style={{ width: `${inProgressWidth}%` }} />
        ) : null}
        {notStartedWidth > 0 ? (
          <div className="h-full bg-stone-300 dark:bg-stone-600" style={{ width: `${notStartedWidth}%` }} />
        ) : null}
      </div>

      <ul className="mt-4 space-y-2">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-stone-600 dark:text-stone-400">
              <span className={cn('h-2 w-2 shrink-0 rounded-full', row.dotClass)} aria-hidden />
              {row.label}
            </span>
            <span className="shrink-0 font-semibold tabular-nums text-stone-900 dark:text-stone-100">{row.value}</span>
          </li>
        ))}
      </ul>

      {totalSubjects > 0 ? (
        <p className="mt-3 text-xs text-stone-500 dark:text-stone-400">
          {totalSubjects} ders altında toplam {totalTopics} konu
        </p>
      ) : null}
    </>
  );
}

export function DashboardStatsGrid({ isLoading, loadError, stats, vm, onRetry }: DashboardStatsGridProps) {
  const denemeSparkline = vm.denemeSparkline;
  const completedTopics = stats?.completedTopics ?? 0;
  const inProgressTopics = stats?.inProgressTopics ?? 0;
  const notStartedTopics = stats?.notStartedTopics ?? 0;

  if (isLoading) {
    return <StatsPanelSkeleton />;
  }

  if (loadError) {
    return (
      <section className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/20 sm:mb-10">
        <p className="text-sm font-medium text-red-800 dark:text-red-300">{loadError}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Tekrar dene
          </button>
        ) : null}
      </section>
    );
  }

  return (
    <section
      className="mb-8 overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900/80 sm:mb-10"
      aria-labelledby="dashboard-stats-heading"
    >
      <div className="flex items-start gap-4 border-b border-stone-100 px-5 py-4 dark:border-stone-800 sm:px-6 sm:py-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800">
          <LayoutDashboard className="h-5 w-5 text-stone-600 dark:text-stone-300" aria-hidden />
        </div>
        <div>
          <h2 id="dashboard-stats-heading" className="font-display text-lg font-bold text-stone-900 dark:text-stone-100 sm:text-xl">
            Özet sayılar
          </h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Konu, çalışma, deneme ve sınav hedefiniz
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4">
        <PanelCell
          href="/dashboard/detail"
          ariaLabel="Konu ilerlemesi — konu detayına git"
          className="border-b border-stone-100 dark:border-stone-800 sm:border-b-0 sm:border-r lg:border-r"
        >
          <CellLabel icon={<CheckCircle className="h-3.5 w-3.5" aria-hidden />}>Konu ilerlemesi</CellLabel>
          <TopicProgressSummary
            completed={completedTopics}
            inProgress={inProgressTopics}
            notStarted={notStartedTopics}
            totalTopics={vm.totalTopics}
            totalSubjects={stats?.totalSubjects ?? 0}
            completionRate={vm.completionRate}
          />
          <p className="mt-auto pt-4 text-xs font-medium text-primary-600 dark:text-primary-400">Konu detayına git →</p>
        </PanelCell>

        <PanelCell
          href="/dashboard/pomodoro"
          ariaLabel="Çalışma süresi — pomodoro sayfasına git"
          className="border-b border-stone-100 dark:border-stone-800 lg:border-b-0 lg:border-r"
        >
          <CellLabel icon={<Clock className="h-3.5 w-3.5" aria-hidden />}>Çalışma süresi</CellLabel>
          <p className="font-display text-3xl font-bold tabular-nums tracking-tight text-stone-900 dark:text-stone-50">
            {vm.studyHours}
            <span className="ml-1.5 text-base font-semibold text-stone-400 dark:text-stone-500">saat</span>
          </p>
          {stats?.user?.dailyStudyHours != null && (
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              Günlük hedef:{' '}
              <span className="font-semibold text-stone-900 dark:text-stone-100">{stats.user.dailyStudyHours}</span> saat
            </p>
          )}
          {stats?.study ? (
            <div className="mt-4">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">
                Bu hafta
              </p>
              <div className="grid grid-cols-7 gap-1">
                {WEEK_DAY_LABELS.map((label) => {
                  const day = vm.weeklyStudyByLabel?.get(label);
                  const goalHours = day ? day.goalMinutes / 60 : 0;
                  const met = day?.completed ?? false;
                  const hoursStudied = day?.hoursStudied ?? 0;
                  return (
                    <div
                      key={label}
                      className={cn(
                        'flex flex-col items-center rounded-md py-1.5',
                        met ? 'bg-primary-50 dark:bg-primary-950/40' : 'bg-stone-50 dark:bg-stone-800/60',
                      )}
                      title={day ? `${label}: ${hoursStudied} / ${goalHours} saat${met ? ' ✓' : ''}` : label}
                    >
                      <span className="text-[9px] font-semibold text-stone-500 dark:text-stone-400">{label}</span>
                      {met ? (
                        <CheckCircle className="mt-0.5 h-3 w-3 text-primary-600 dark:text-primary-400" />
                      ) : (
                        <Circle className="mt-0.5 h-3 w-3 text-stone-300 dark:text-stone-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">Haftalık özet henüz yok.</p>
          )}
          <p className="mt-auto pt-4 text-xs font-medium text-primary-600 dark:text-primary-400">Pomodoro sayfasına git →</p>
        </PanelCell>

        <PanelCell
          href="/dashboard/deneme"
          ariaLabel="Deneme takibi — deneme sayfasına git"
          className="border-b border-stone-100 dark:border-stone-800 sm:border-b-0 sm:border-r lg:border-r"
        >
          <CellLabel icon={<ClipboardList className="h-3.5 w-3.5" aria-hidden />}>Deneme takibi</CellLabel>
          {stats?.deneme && stats.deneme.totalAttempts > 0 ? (
            <>
              <p className="font-display text-3xl font-bold tabular-nums tracking-tight text-stone-900 dark:text-stone-50">
                {stats.deneme.totalAttempts}
                <span className="ml-1.5 text-base font-semibold text-stone-400 dark:text-stone-500">deneme</span>
              </p>
              {stats.deneme.lastAttemptNet != null && (
                <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                  Son net:{' '}
                  <span className="font-semibold tabular-nums text-stone-900 dark:text-stone-100">{stats.deneme.lastAttemptNet}</span>
                </p>
              )}
              {stats.deneme.lastAttemptAt && (
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                  {new Date(stats.deneme.lastAttemptAt).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              )}
              {stats.deneme.recentAttempts && stats.deneme.recentAttempts.length > 0 && denemeSparkline && (
                <div className="mt-4 flex h-8 items-end gap-0.5" aria-hidden>
                  {denemeSparkline.slice.map((a, i) => {
                    const net = a.netScore ?? 0;
                    const h = Math.max(8, ((net - denemeSparkline.minNet) / denemeSparkline.range) * 100);
                    return (
                      <div
                        key={`${a.attemptedAt}-${i}`}
                        className="min-w-0 flex-1 rounded-t bg-stone-300 dark:bg-stone-600"
                        style={{ height: `${Math.min(100, h)}%` }}
                        title={`${new Date(a.attemptedAt).toLocaleDateString('tr-TR')}: ${net} net`}
                      />
                    );
                  })}
                </div>
              )}
              <p className="mt-auto pt-4 text-xs font-medium text-primary-600 dark:text-primary-400">Deneme sayfası →</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-stone-300 dark:text-stone-600">—</p>
              <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">Henüz kayıt yok</p>
              <p className="mt-auto pt-4 text-xs font-medium text-primary-600 dark:text-primary-400">İlk denemeyi ekle →</p>
            </>
          )}
        </PanelCell>

        <PanelCell href="/dashboard/settings" ariaLabel="Sınav ve hedef — ayarlar sayfasına git">
          <CellLabel icon={<Target className="h-3.5 w-3.5" aria-hidden />}>Sınav ve hedef</CellLabel>
          {stats?.activeExam ? (
            <>
              {stats.activeExam.startDate && vm.examCountdown.kind === 'future' ? (
                <p className="font-display text-3xl font-bold tabular-nums tracking-tight text-stone-900 dark:text-stone-50">
                  {vm.examCountdown.daysLeft}
                  <span className="ml-1.5 text-base font-semibold text-stone-400 dark:text-stone-500">gün kaldı</span>
                </p>
              ) : vm.examCountdown.kind === 'today' ? (
                <p className="font-display text-2xl font-bold text-accent-700 dark:text-accent-400">Sınav bugün</p>
              ) : (
                <p className="font-display text-2xl font-bold text-stone-400 dark:text-stone-500">—</p>
              )}
              <p className="mt-2 line-clamp-2 text-sm font-medium text-stone-900 dark:text-stone-100" title={stats.activeExam.name}>
                {stats.activeExam.name}
              </p>
              {!stats.activeExam.startDate && (
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Sınav tarihi ayarlardan eklenebilir</p>
              )}
              {stats.activeExam.startDate && vm.examCountdown.kind === 'past' && (
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Sınav tarihi geçti</p>
              )}
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-stone-300 dark:text-stone-600">—</p>
              <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">Aktif sınav seçilmedi</p>
            </>
          )}
          {stats?.user?.targetScore != null && (
            <div className="mt-4 flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2 dark:bg-stone-800/60">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Hedef puan</span>
              <span className="text-lg font-bold tabular-nums text-stone-900 dark:text-stone-100">{stats.user.targetScore}</span>
            </div>
          )}
          <p className="mt-auto pt-4 text-xs font-medium text-primary-600 dark:text-primary-400">Ayarlara git →</p>
        </PanelCell>
      </div>
    </section>
  );
}
