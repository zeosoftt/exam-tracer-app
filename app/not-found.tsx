/**
 * Global 404 — Next.js App Router (notFound() ve eşleşmeyen URL'ler)
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Home, LogIn, HelpCircle, Search } from 'lucide-react';
import { PublicThemeCorner } from '@/components/layout/PublicThemeCorner';

export const metadata: Metadata = {
  title: 'Sayfa bulunamadı',
  description: 'Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4 py-16 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <PublicThemeCorner />
      <div className="w-full max-w-lg text-center">
        <Link href="/" className="group mb-10 inline-flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 transition-shadow group-hover:shadow-primary-500/40">
            <BookOpen className="h-7 w-7" />
          </div>
          <span className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100">The Goal Lab</span>
        </Link>

        <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-soft-lg dark:border-stone-800 dark:bg-stone-900/90 sm:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400">
            <Search className="h-8 w-8" />
          </div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">404</p>
          <h1 className="mb-3 font-display text-2xl font-extrabold text-stone-900 dark:text-stone-100 sm:text-3xl">
            Sayfa bulunamadı
          </h1>
          <p className="mb-8 text-sm leading-relaxed text-stone-600 dark:text-stone-400 sm:text-base">
            Bu adres yanlış yazılmış olabilir veya sayfa kaldırılmış olabilir. Ana sayfadan devam
            edebilir veya sıkça sorulan sorulara göz atabilirsiniz.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/25 hover:from-primary-700 hover:to-primary-600 transition-all"
            >
              <Home className="h-4 w-4" />
              Ana sayfa
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800"
            >
              <LogIn className="h-4 w-4" />
              Giriş yap
            </Link>
          </div>
          <p className="mt-6 text-center">
            <Link
              href="/sss"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              <HelpCircle className="h-4 w-4" />
              Sıkça sorulan sorular
            </Link>
          </p>
        </div>

        <p className="mt-8 text-sm text-stone-500 dark:text-stone-400">
          Yardıma mı ihtiyacınız var?{' '}
          <Link href="/" className="font-medium text-primary-600 hover:underline dark:text-primary-400">
            thegoallab.com
          </Link>
        </p>
      </div>
    </div>
  );
}
