'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Menu, X } from 'lucide-react';
import { ThemeToggleCompact } from '@/components/theme/ThemeToggleCompact';

const NAV_LINK_CLASS =
  'block rounded-xl px-3 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-primary-700 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-primary-300 lg:inline-block lg:rounded-none lg:px-0 lg:py-0 lg:hover:bg-transparent';

/** Ana sayfa bölümleri + SEO sayfaları — header sade tutulur; Destek footer'da */
const MARKETING_NAV = [
  { label: 'Nasıl çalışır', href: '/#nasil' },
  { label: 'Özellikler', href: '/ozellikler' },
  { label: 'Sınavlar', href: '/sinavlar' },
  { label: 'Paketler', href: '/#paketler' },
  { label: 'SSS', href: '/sss' },
] as const;

export function MarketingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-stone-200/70 bg-white/75 backdrop-blur-xl dark:border-stone-800/70 dark:bg-stone-950/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3 sm:h-20">
          <Link href="/" className="group flex min-w-0 items-center gap-2 sm:gap-3" onClick={closeMobile}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-600/25 transition-shadow group-hover:shadow-primary-600/40 sm:h-12 sm:w-12">
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <span className="truncate font-display text-lg font-bold text-stone-900 dark:text-stone-100 sm:text-2xl">
              The Goal Lab
            </span>
          </Link>

          <nav
            className="hidden items-center gap-5 text-sm font-medium text-stone-700 dark:text-stone-300 lg:flex"
            aria-label="Site gezinmesi"
          >
            {MARKETING_NAV.map(({ label, href }) =>
              href.startsWith('/#') ? (
                <a key={href} href={href} className={NAV_LINK_CLASS}>
                  {label}
                </a>
              ) : (
                <Link key={href} href={href} className={NAV_LINK_CLASS}>
                  {label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2 md:gap-4">
            <div className="hidden md:block">
              <ThemeToggleCompact />
            </div>
            <Link
              href="/auth/login"
              className="hidden text-sm font-medium text-stone-700 transition-colors hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100 md:block"
            >
              Giriş Yap
            </Link>
            <Link
              href="/onboarding"
              className="hidden items-center justify-center rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-all hover:from-primary-800 hover:to-primary-700 md:inline-flex"
            >
              Başla
            </Link>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200/80 text-stone-700 transition-colors hover:bg-stone-100 dark:border-stone-700/80 dark:text-stone-200 dark:hover:bg-stone-800 lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="marketing-mobile-nav"
              aria-label={mobileOpen ? 'Menüyü kapat' : 'Menüyü aç'}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <nav
            id="marketing-mobile-nav"
            className="border-t border-stone-200/70 pb-4 pt-3 dark:border-stone-800/70 lg:hidden"
            aria-label="Mobil site gezinmesi"
          >
            <div className="flex flex-col gap-1">
              {MARKETING_NAV.map(({ label, href }) =>
                href.startsWith('/#') ? (
                  <a key={href} href={href} className={NAV_LINK_CLASS} onClick={closeMobile}>
                    {label}
                  </a>
                ) : (
                  <Link key={href} href={href} className={NAV_LINK_CLASS} onClick={closeMobile}>
                    {label}
                  </Link>
                ),
              )}
              <Link href="/destek" className={NAV_LINK_CLASS} onClick={closeMobile}>
                Destek
              </Link>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center rounded-xl border border-stone-200/80 px-3 py-2.5 text-sm font-semibold text-stone-700 dark:border-stone-700/80 dark:text-stone-200"
                onClick={closeMobile}
              >
                Giriş Yap
              </Link>
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/25"
                onClick={closeMobile}
              >
                Başla
              </Link>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-stone-200/80 px-3 py-2.5 dark:border-stone-700/80 md:hidden">
              <span className="text-sm font-medium text-stone-600 dark:text-stone-300">Tema</span>
              <ThemeToggleCompact />
            </div>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
