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
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-soft-lg border border-stone-100 p-8 text-center">
        <h1 className="font-display mb-4 text-2xl font-bold text-red-600">Hata</h1>
        <p className="mb-6 text-stone-600">{message}</p>
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
