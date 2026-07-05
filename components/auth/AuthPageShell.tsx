'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { BookOpen } from 'lucide-react';

type AuthPageShellProps = {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
  banner?: ReactNode;
};

/** Tüm auth sayfaları için ortak kabuk. */
export function AuthPageShell({
  title,
  subtitle,
  backHref = '/',
  backLabel = 'Ana sayfaya dön',
  children,
  banner,
}: AuthPageShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 py-12 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="group mb-4 inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 transition-shadow group-hover:shadow-primary-500/40">
              <BookOpen className="h-6 w-6" />
            </div>
            <span className="font-display text-2xl font-bold text-stone-900 dark:text-stone-100">The Goal Lab</span>
          </Link>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-soft-lg dark:border-stone-800 dark:bg-stone-900/90 sm:p-8">
          <div className="mb-8 text-center">
            <h1 className="mb-2 font-display text-3xl font-extrabold text-stone-900 dark:text-stone-100">{title}</h1>
            {subtitle ? <p className="text-stone-600 dark:text-stone-400">{subtitle}</p> : null}
          </div>

          {banner}

          {children}

          {backHref ? (
            <div className="mt-6 text-center">
              <Link
                href={backHref}
                className="text-sm font-medium text-stone-500 transition-colors hover:text-primary-600 dark:text-stone-400 dark:hover:text-primary-400"
              >
                {backLabel}
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
