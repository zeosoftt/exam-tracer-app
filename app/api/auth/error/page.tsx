/**
 * Auth Error Page
 */

'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function AuthErrorPage() {
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
    <div className="flex min-h-screen items-center justify-center bg-secondary-50 px-4">
      <div className="card max-w-md text-center">
        <h1 className="mb-4 text-2xl font-bold text-danger-600">Hata</h1>
        <p className="mb-6 text-secondary-600">{message}</p>
        <Link href="/auth/login" className="btn-primary">
          Giriş Sayfasına Dön
        </Link>
      </div>
    </div>
  );
}
