'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuthPageShell } from '@/components/auth/AuthPageShell';

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
    <AuthPageShell title="Hata" subtitle={message} backHref="/auth/login" backLabel="Giriş sayfasına dön">
      <Link
        href="/auth/login"
        className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary-500/30 transition-all hover:from-primary-800 hover:to-primary-700"
      >
        Giriş Yap
      </Link>
    </AuthPageShell>
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
