'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-12 text-center">
      <AlertTriangle className="h-10 w-10 text-amber-500" aria-hidden />
      <h1 className="mt-4 text-xl font-bold text-stone-900 dark:text-stone-100">Panel yüklenemedi</h1>
      <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
        Geçici bir sorun oluşmuş olabilir. Lütfen tekrar deneyin.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          Tekrar dene
        </button>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold dark:border-stone-700"
        >
          Ana panele dön
        </Link>
      </div>
    </div>
  );
}
