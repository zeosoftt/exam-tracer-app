'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { ThemeToggleCompact } from '@/components/theme/ThemeToggleCompact';

export function MarketingHeader() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-stone-200 bg-white/80 backdrop-blur-xl dark:border-stone-800 dark:bg-stone-950/85">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between sm:h-20">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-600/25 transition-shadow group-hover:shadow-primary-600/40 sm:h-12 sm:w-12">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <span className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 sm:text-2xl">
              The Goal Lab
            </span>
          </Link>
          <nav
            className="hidden items-center gap-6 text-sm font-medium text-stone-700 dark:text-stone-300 md:flex"
            aria-label="Sayfa bölümleri"
          >
            <a href="/#sorunlar" className="transition-colors hover:text-primary-700 dark:hover:text-primary-300">
              Sorunlar
            </a>
            <a href="/#nasil" className="transition-colors hover:text-primary-700 dark:hover:text-primary-300">
              Nasıl çalışır
            </a>
            <a href="/#ozellikler" className="transition-colors hover:text-primary-700 dark:hover:text-primary-300">
              Özellikler
            </a>
            <a href="/#paketler" className="transition-colors hover:text-primary-700 dark:hover:text-primary-300">
              Paketler
            </a>
            <Link href="/sinavlar" className="transition-colors hover:text-primary-700 dark:hover:text-primary-300">
              Sınavlar
            </Link>
            <Link href="/ozellikler" className="transition-colors hover:text-primary-700 dark:hover:text-primary-300">
              Özellikler
            </Link>
            <Link href="/sss" className="transition-colors hover:text-primary-700 dark:hover:text-primary-300">
              SSS
            </Link>
            <a href="/#yorumlar" className="transition-colors hover:text-primary-700 dark:hover:text-primary-300">
              Yorumlar
            </a>
            <Link href="/destek" className="transition-colors hover:text-primary-700 dark:hover:text-primary-300">
              Destek
            </Link>
          </nav>
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggleCompact />
            <Link
              href="/auth/login"
              className="hidden text-sm font-medium text-stone-700 transition-colors hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100 sm:block"
            >
              Giriş Yap
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:from-primary-800 hover:to-primary-700 sm:px-6"
            >
              Başla
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
