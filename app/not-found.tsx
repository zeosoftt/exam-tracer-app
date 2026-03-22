/**
 * Global 404 — Next.js App Router (notFound() ve eşleşmeyen URL'ler)
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Home, LogIn, HelpCircle, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sayfa bulunamadı',
  description: 'Aradığınız sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <Link href="/" className="inline-flex items-center gap-3 mb-10 group">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-shadow">
            <BookOpen className="h-7 w-7" />
          </div>
          <span className="font-display text-2xl font-bold text-stone-900">The Goal Lab</span>
        </Link>

        <div className="rounded-3xl border border-stone-200 bg-white p-8 sm:p-10 shadow-soft-lg">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100 text-stone-500">
            <Search className="h-8 w-8" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-600 mb-2">404</p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 mb-3">
            Sayfa bulunamadı
          </h1>
          <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-8">
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
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-800 hover:bg-stone-50 transition-colors"
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

        <p className="mt-8 text-sm text-stone-500">
          Yardıma mı ihtiyacınız var?{' '}
          <Link href="/" className="text-primary-600 font-medium hover:underline">
            thegoallab.com
          </Link>
        </p>
      </div>
    </div>
  );
}
