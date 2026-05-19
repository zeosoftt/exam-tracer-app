'use client';

import Link from 'next/link';
import type { DashboardStats } from '@/components/dashboard/domain/dashboardTypes';

type DashboardHeroSectionProps = {
  todayLabel: string;
  firstName: string;
  statsUpdatedAt: Date | null;
  isLoading: boolean;
  stats: DashboardStats | null;
  srsOverdue: number;
  srsDueWeek: number;
};

export function DashboardHeroSection({
  todayLabel,
  firstName,
  statsUpdatedAt,
  isLoading,
  stats,
  srsOverdue,
  srsDueWeek,
}: DashboardHeroSectionProps) {
  return (
    <section
      className="mb-8 rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900/80 sm:mb-10 sm:p-8"
      aria-labelledby="dashboard-hero-title"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-stone-500 dark:text-stone-400">{todayLabel}</p>
          <h1 id="dashboard-hero-title" className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Merhaba, {firstName}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-600 dark:text-stone-400">
            Önce bugünkü rutininizi seçin: konu çalışması, tekrar veya deneme. Sayılar aşağıda; detay için ilgili
            sayfaya geçin.
          </p>
          {statsUpdatedAt && !isLoading && (
            <p className="mt-3 text-xs text-stone-400 dark:text-stone-500">
              Son güncelleme:{' '}
              {statsUpdatedAt.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <nav className="flex flex-col gap-2 sm:min-w-[240px]" aria-label="Hızlı işlemler">
          {srsOverdue > 0 && (
            <a href="#srs-section" className="btn btn-primary justify-center text-sm !py-3">
              {srsOverdue} tekrar gecikmiş — listeye git
            </a>
          )}
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/detail" className="btn btn-secondary min-w-[6rem] flex-1 justify-center text-sm !py-2.5">
              Konular
            </Link>
            <Link href="/dashboard/pomodoro" className="btn btn-secondary min-w-[6rem] flex-1 justify-center text-sm !py-2.5">
              Pomodoro
            </Link>
            <Link href="/dashboard/deneme" className="btn btn-secondary min-w-[6rem] flex-1 justify-center text-sm !py-2.5">
              Deneme
            </Link>
          </div>
          {!isLoading && stats && (srsDueWeek > 0 || srsOverdue > 0) && (
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {srsDueWeek > 0 && <span>Bu hafta {srsDueWeek} tekrar yaklaşıyor. </span>}
              Gecikenleri yukarıdaki düğme ile açabilirsiniz.
            </p>
          )}
        </nav>
      </div>
      {!isLoading && stats?.activeExam && (
        <p className="mt-6 border-t border-stone-100 pt-4 text-sm dark:border-stone-800">
          <span className="text-stone-500 dark:text-stone-400">Aktif sınav:</span>{' '}
          <span className="font-semibold text-stone-900 dark:text-stone-100">{stats.activeExam.name}</span>
          {typeof stats.completedTopics === 'number' && (
            <span className="mt-1 block text-xs text-stone-500 dark:text-stone-400">
              {stats.completedTopics} konu tamamlandı
              {typeof stats.totalPomodoroSessions === 'number' && stats.totalPomodoroSessions > 0 && (
                <> · {stats.totalPomodoroSessions} pomodoro seansı</>
              )}
            </span>
          )}
        </p>
      )}
      {!isLoading && !stats?.activeExam && (
        <p className="mt-6 border-t border-dashed border-stone-200 pt-4 text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
          Ayarlardan bir sınav seçerek ilerleme ve konu listesini bağlayabilirsiniz.
        </p>
      )}
    </section>
  );
}
