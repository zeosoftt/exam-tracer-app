'use client';

import Link from 'next/link';
import { CheckCircle, Circle, ClipboardList, Clock, LayoutDashboard, Target } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { WEEK_DAY_LABELS } from '@/components/dashboard/domain/dashboardConstants';
import type { DashboardStats } from '@/components/dashboard/domain/dashboardTypes';
import type { useDashboardViewModel } from '@/components/dashboard/hooks/useDashboardViewModel';

type DashboardViewModel = ReturnType<typeof useDashboardViewModel>;

type DashboardStatsGridProps = {
  isLoading: boolean;
  stats: DashboardStats | null;
  vm: DashboardViewModel;
};

export function DashboardStatsGrid({ isLoading, stats, vm }: DashboardStatsGridProps) {
  const denemeSparkline = vm.denemeSparkline;

  return (
    <>
      <div className="mb-4 flex items-center gap-3 sm:mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800">
          <LayoutDashboard className="h-5 w-5 text-stone-600 dark:text-stone-300" aria-hidden />
        </div>
        <div>
          <h2 className="font-display text-base font-bold sm:text-lg">Özet sayılar</h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 sm:text-sm">
            Tarama için büyük rakamlar; ayrıntı ilgili sayfada
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="mb-8 grid gap-4 sm:mb-10 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900/60"
            >
              <div className="mb-4 flex gap-3">
                <div className="h-10 w-10 rounded-lg bg-stone-200 dark:bg-stone-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 rounded bg-stone-100 dark:bg-stone-800" />
                  <div className="h-8 w-16 rounded bg-stone-200 dark:bg-stone-700" />
                </div>
              </div>
              <div className="h-3 w-full max-w-[90%] rounded bg-stone-100 dark:bg-stone-800" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-8 grid gap-4 sm:mb-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-stone-200 border-l-4 border-l-primary-500 bg-white p-5 dark:border-stone-800 dark:border-l-primary-500 dark:bg-stone-900/80">
            <div className="mb-4 flex items-center gap-3 border-b border-stone-100 pb-3 dark:border-stone-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-400">
                <CheckCircle className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-medium text-stone-500 dark:text-stone-400">Konu ilerlemesi</p>
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Özet</p>
              </div>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-stone-500 dark:text-stone-400">Ders</dt>
                <dd className="tabular-nums font-semibold text-stone-900 dark:text-stone-100">{stats?.totalSubjects ?? 0}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-stone-500 dark:text-stone-400">Konu</dt>
                <dd className="tabular-nums font-semibold text-stone-900 dark:text-stone-100">{vm.totalTopics}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-stone-500 dark:text-stone-400">Tamam</dt>
                <dd className="tabular-nums font-semibold text-stone-900 dark:text-stone-100">{stats?.completedTopics ?? 0}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-stone-500 dark:text-stone-400">Devam / Bekleyen</dt>
                <dd className="tabular-nums font-medium text-stone-700 dark:text-stone-300">
                  {(stats?.inProgressTopics ?? 0) + (stats?.notStartedTopics ?? 0)}
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 dark:border-stone-800">
              <span className="text-xs text-stone-500 dark:text-stone-400">Tamamlanma</span>
              <span className="text-lg font-bold tabular-nums text-primary-700 dark:text-primary-400">{vm.completionRate}%</span>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 border-l-4 border-l-violet-500 bg-white p-5 dark:border-stone-800 dark:border-l-violet-500 dark:bg-stone-900/80">
            <div className="mb-3 flex items-center gap-3 border-b border-stone-100 pb-3 dark:border-stone-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                <Clock className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-medium text-stone-500 dark:text-stone-400">Çalışma süresi</p>
                <p className="text-2xl font-bold tabular-nums text-stone-900 dark:text-stone-50">{vm.studyHours}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">toplam saat</p>
              </div>
            </div>
            {stats?.user?.dailyStudyHours != null && (
              <p className="mb-3 text-sm text-stone-600 dark:text-stone-400">
                Günlük hedef:{' '}
                <span className="font-semibold text-stone-900 dark:text-stone-100">{stats.user.dailyStudyHours}</span> saat/gün
              </p>
            )}
            {stats?.study && (
              <div>
                <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-stone-400 dark:text-stone-500">Bu hafta</p>
                <div className="grid grid-cols-7 gap-0.5">
                  {WEEK_DAY_LABELS.map((label) => {
                    const day = vm.weeklyStudyByLabel?.get(label);
                    const goalHours = day ? day.goalMinutes / 60 : 0;
                    const met = day?.completed ?? false;
                    const hoursStudied = day?.hoursStudied ?? 0;
                    return (
                      <div
                        key={label}
                        className={cn(
                          'flex flex-col items-center rounded py-1',
                          met ? 'bg-primary-100 dark:bg-primary-950/60' : 'bg-stone-100 dark:bg-stone-800/80',
                        )}
                        title={day ? `${label}: ${hoursStudied} / ${goalHours} saat${met ? ' ✓' : ''}` : label}
                      >
                        <span className="text-[8px] font-semibold text-stone-600 dark:text-stone-400">{label}</span>
                        {met ? (
                          <CheckCircle className="mt-0.5 h-2.5 w-2.5 text-primary-600 dark:text-primary-400" />
                        ) : (
                          <Circle className="mt-0.5 h-2.5 w-2.5 text-stone-300 dark:text-stone-600" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <Link
            href="/dashboard/deneme"
            className="block rounded-2xl border border-stone-200 border-l-4 border-l-accent-500 bg-white p-5 transition-colors hover:bg-stone-50 dark:border-stone-800 dark:border-l-accent-500 dark:bg-stone-900/80 dark:hover:bg-stone-900"
          >
            <div className="mb-3 flex items-center gap-3 border-b border-stone-100 pb-3 dark:border-stone-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-100 text-accent-800 dark:bg-accent-950 dark:text-accent-300">
                <ClipboardList className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-medium text-stone-500 dark:text-stone-400">Deneme takibi</p>
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Kayıtlar ve net</p>
              </div>
            </div>
            {stats?.deneme && stats.deneme.totalAttempts > 0 ? (
              <>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  <span className="font-semibold text-stone-900 dark:text-stone-100">{stats.deneme.totalAttempts}</span> deneme
                </p>
                {stats.deneme.lastAttemptAt && (
                  <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                    Son:{' '}
                    {new Date(stats.deneme.lastAttemptAt).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                )}
                {stats.deneme.recentAttempts && stats.deneme.recentAttempts.length > 0 && denemeSparkline && (
                  <div className="mt-3 flex h-10 items-end gap-0.5" aria-hidden>
                    {denemeSparkline.slice.map((a, i) => {
                      const net = a.netScore ?? 0;
                      const h = Math.max(8, ((net - denemeSparkline.minNet) / denemeSparkline.range) * 100);
                      return (
                        <div
                          key={`${a.attemptedAt}-${i}`}
                          className="min-w-0 flex-1 rounded-t bg-accent-500/40 dark:bg-accent-500/30"
                          style={{ height: `${Math.min(100, h)}%` }}
                          title={`${new Date(a.attemptedAt).toLocaleDateString('tr-TR')}: ${net} net`}
                        />
                      );
                    })}
                  </div>
                )}
                <p className="mt-3 text-xs font-medium text-primary-600 dark:text-primary-400">Detaya git →</p>
              </>
            ) : (
              <p className="text-sm text-stone-500 dark:text-stone-400">Henüz deneme yok — eklemek için tıklayın</p>
            )}
          </Link>

          <div className="rounded-2xl border border-stone-200 border-l-4 border-l-teal-600 bg-white p-5 dark:border-stone-800 dark:border-l-teal-500 dark:bg-stone-900/80">
            <div className="mb-3 flex items-center gap-3 border-b border-stone-100 pb-3 dark:border-stone-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                <Target className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-medium text-stone-500 dark:text-stone-400">Sınav ve hedef</p>
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Takvim</p>
              </div>
            </div>
            {stats?.activeExam ? (
              <>
                <p className="line-clamp-2 text-sm font-medium text-stone-900 dark:text-stone-100" title={stats.activeExam.name}>
                  {stats.activeExam.name}
                </p>
                {stats.activeExam.startDate ? (
                  vm.examCountdown.kind === 'future' ? (
                    <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                      Sınava{' '}
                      <span className="font-bold tabular-nums text-stone-900 dark:text-stone-100">{vm.examCountdown.daysLeft}</span> gün
                    </p>
                  ) : vm.examCountdown.kind === 'today' ? (
                    <p className="mt-2 text-sm font-semibold text-accent-700 dark:text-accent-400">Sınav bugün</p>
                  ) : (
                    <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">Sınav tarihi geçti</p>
                  )
                ) : (
                  <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">Tarih atanmadı</p>
                )}
              </>
            ) : (
              <p className="text-sm text-stone-500 dark:text-stone-400">Aktif sınav yok</p>
            )}
            {stats?.user?.targetScore != null && (
              <div className="mt-4 border-t border-stone-100 pt-3 dark:border-stone-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-500 dark:text-stone-400">Hedef puan</span>
                  <span className="text-xl font-bold tabular-nums text-teal-700 dark:text-teal-400">{stats.user.targetScore}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
