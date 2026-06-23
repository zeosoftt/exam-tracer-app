'use client';

import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import type { DashboardStats } from '@/components/dashboard/domain/dashboardTypes';

type DashboardHeroSectionProps = {
  todayLabel: string;
  firstName: string;
  statsUpdatedAt: Date | null;
  isLoading: boolean;
  stats: DashboardStats | null;
  srsOverdue: number;
};

const QUICK_LINKS = [
  { href: '/dashboard/detail', label: 'Konular' },
  { href: '/dashboard/pomodoro', label: 'Pomodoro' },
  { href: '/dashboard/deneme', label: 'Deneme' },
] as const;

function SrsOverdueButton({ count }: { count: number }) {
  return (
    <a
      href="#srs-section"
      className="group flex items-center gap-3 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-red-50/40 px-4 py-3.5 shadow-sm transition-all hover:border-red-300 hover:from-red-100 hover:to-red-50 hover:shadow-md dark:border-red-900/50 dark:from-red-950/40 dark:to-red-950/20 dark:hover:border-red-800 dark:hover:from-red-950/60"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
        <AlertCircle className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-sm font-semibold text-red-950 dark:text-red-100">
          {count} tekrar gecikmiş
        </span>
        <span className="mt-0.5 block text-xs text-red-700/90 dark:text-red-300/90">Aralıklı tekrar listesine git</span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors group-hover:bg-red-700 dark:bg-red-700 dark:group-hover:bg-red-600">
        Listeye git
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </a>
  );
}

function QuickLinkButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="btn btn-secondary min-w-0 flex-1 justify-center !px-3 !py-3 shadow-sm ring-1 ring-stone-300/80 hover:shadow-md active:scale-[0.98] dark:ring-stone-600 sm:!px-4"
    >
      {label}
    </Link>
  );
}

export function DashboardHeroSection({
  todayLabel,
  firstName,
  statsUpdatedAt,
  isLoading,
  stats,
  srsOverdue,
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

        <nav className="flex w-full flex-col gap-3 sm:min-w-[280px] lg:max-w-sm" aria-label="Hızlı işlemler">
          {srsOverdue > 0 && <SrsOverdueButton count={srsOverdue} />}

          <div className="flex gap-2">
            {QUICK_LINKS.map((link) => (
              <QuickLinkButton key={link.href} href={link.href} label={link.label} />
            ))}
          </div>
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
