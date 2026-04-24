/**
 * Auth Error Page
 */

'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    Configuration: 'Sunucu yapılandırma hatası',
    AccessDenied: 'Erişim reddedildi',
    Verification: 'Doğrulama hatası',
    Default: 'Bir hata oluştu',
  };

  const message = errorMessages[error || ''] || errorMessages.Default;

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-soft-lg dark:border-stone-800 dark:bg-stone-900/90">
        <h1 className="font-display mb-4 text-2xl font-bold text-red-600 dark:text-red-400">Hata</h1>
        <p className="mb-6 text-stone-600 dark:text-stone-400">{message}</p>
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl shadow-lg shadow-primary-500/30 hover:from-primary-700 hover:to-primary-600 transition-all"
        >
          Giriş Sayfasına Dön
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-stone-50 text-stone-600 dark:bg-stone-950 dark:text-stone-400">
          Yükleniyor...
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
