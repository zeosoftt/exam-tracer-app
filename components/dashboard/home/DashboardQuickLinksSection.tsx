'use client';

import Link from 'next/link';
import { ArrowUpRight, BarChart3, ClipboardList, Settings, Timer } from 'lucide-react';

export function DashboardQuickLinksSection() {
  return (
    <section className="mt-10 sm:mt-12" aria-labelledby="quick-links-heading">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 id="quick-links-heading" className="font-display text-base font-bold text-stone-900 dark:text-stone-100 sm:text-lg">
            Sayfalar
          </h2>
          <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400 sm:text-sm">
            Aynı düzeni ayarlarda da bulabilirsiniz; burada tek tıkla geçiş
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        <Link
          href="/dashboard/detail"
          className="group relative flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-4 shadow-soft transition-colors duration-200 hover:border-primary-300 dark:border-stone-800 dark:bg-stone-900/80 dark:hover:border-primary-700 sm:min-h-[7.5rem] sm:p-5"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700 transition-colors group-hover:bg-primary-600 group-hover:text-white">
              <BarChart3 className="h-5 w-5" aria-hidden />
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary-600 dark:text-stone-600 dark:group-hover:text-primary-400" />
          </div>
          <span className="font-display font-semibold text-stone-900 group-hover:text-primary-700 dark:text-stone-100 dark:group-hover:text-primary-400">
            Konu detayı
          </span>
          <span className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">Ders ve konu ilerlemesini güncelleyin</span>
        </Link>
        <Link
          href="/dashboard/deneme"
          className="group relative flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-4 shadow-soft transition-colors duration-200 hover:border-accent-300 dark:border-stone-800 dark:bg-stone-900/80 dark:hover:border-accent-700 sm:min-h-[7.5rem] sm:p-5"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-100 text-accent-700 transition-colors group-hover:bg-accent-500 group-hover:text-white">
              <ClipboardList className="h-5 w-5" aria-hidden />
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-600 dark:text-stone-600 dark:group-hover:text-accent-400" />
          </div>
          <span className="font-display font-semibold text-stone-900 group-hover:text-accent-700 dark:text-stone-100 dark:group-hover:text-accent-400">
            Deneme takibi
          </span>
          <span className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">Deneme kayıtları ve net trendi</span>
        </Link>
        <Link
          href="/dashboard/pomodoro"
          className="group relative flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-4 shadow-soft transition-colors duration-200 hover:border-violet-300 dark:border-stone-800 dark:bg-stone-900/80 dark:hover:border-violet-700 sm:min-h-[7.5rem] sm:p-5"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700 transition-colors group-hover:bg-violet-600 group-hover:text-white">
              <Timer className="h-5 w-5" aria-hidden />
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-violet-600 dark:text-stone-600 dark:group-hover:text-violet-400" />
          </div>
          <span className="font-display font-semibold text-stone-900 group-hover:text-violet-700 dark:text-stone-100 dark:group-hover:text-violet-400">
            Pomodoro
          </span>
          <span className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">Odaklanma seansları ve istatistik</span>
        </Link>
        <Link
          href="/dashboard/settings"
          className="group relative flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-4 shadow-soft transition-colors duration-200 hover:border-stone-400 dark:border-stone-800 dark:bg-stone-900/80 dark:hover:border-stone-600 sm:min-h-[7.5rem] sm:p-5"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-stone-100 text-stone-700 transition-colors group-hover:bg-stone-800 group-hover:text-white">
              <Settings className="h-5 w-5" aria-hidden />
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-stone-600 dark:text-stone-600 dark:group-hover:text-stone-400" />
          </div>
          <span className="font-display font-semibold text-stone-900 group-hover:text-stone-800 dark:text-stone-100 dark:group-hover:text-stone-200">
            Ayarlar
          </span>
          <span className="text-xs leading-relaxed text-stone-500 dark:text-stone-400">Tema, hedef puan ve hesap</span>
        </Link>
      </div>
    </section>
  );
}
