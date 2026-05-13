/**
 * E-posta doğrulama sayfası
 * Link: /auth/verify-email?token=...
 */

'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { postVerifyEmail } from '@/lib/client-api/authForms';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token?.trim()) {
      setStatus('error');
      setMessage('Doğrulama bağlantısı geçersiz veya eksik.');
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const r = await postVerifyEmail(token);
        if (cancelled) return;
        if (r.ok && r.success) {
          setStatus('success');
          setMessage(r.message || 'E-posta adresiniz doğrulandı.');
          setTimeout(() => router.push('/auth/login?verified=1'), 2500);
        } else {
          setStatus('error');
          setMessage(
            r.errorMessage ||
              'Doğrulama yapılamadı. Bağlantı geçersiz veya süresi dolmuş olabilir.',
          );
        }
      } catch {
        if (!cancelled) {
          setStatus('error');
          setMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, router]);

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
          <div className="text-center">
            {status === 'loading' && (
              <>
                <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary-600" />
                <h1 className="mb-2 text-xl font-semibold text-stone-900 dark:text-stone-100">E-posta doğrulanıyor</h1>
                <p className="text-stone-600 dark:text-stone-400">Lütfen bekleyin...</p>
              </>
            )}
            {status === 'success' && (
              <>
                <div className="mb-4 flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-950/60">
                    <CheckCircle className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <h1 className="mb-2 text-xl font-semibold text-stone-900 dark:text-stone-100">Doğrulama başarılı</h1>
                <p className="mb-6 text-stone-600 dark:text-stone-400">{message}</p>
                <p className="text-sm text-stone-500 dark:text-stone-400">Giriş sayfasına yönlendiriliyorsunuz...</p>
              </>
            )}
            {status === 'error' && (
              <>
                <div className="mb-4 flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50">
                    <XCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
                <h1 className="mb-2 text-xl font-semibold text-stone-900 dark:text-stone-100">Doğrulama başarısız</h1>
                <p className="mb-6 text-stone-600 dark:text-stone-400">{message}</p>
                <Link
                  href="/auth/login"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-primary-600 px-4 py-3 font-medium text-white transition-colors hover:bg-primary-700"
                >
                  Giriş sayfasına git
                </Link>
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">
          <Link href="/auth/login" className="text-primary-600 hover:underline dark:text-primary-400">
            Giriş yap
          </Link>
          {' · '}
          <Link href="/" className="text-primary-600 hover:underline dark:text-primary-400">
            Ana sayfa
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-stone-50 dark:bg-stone-950">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
