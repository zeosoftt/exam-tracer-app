/**
 * E-posta doğrulama sayfası
 * Link: /auth/verify-email?token=...
 */

'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Loader2, CheckCircle, XCircle } from 'lucide-react';

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
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token.trim() }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && data.success) {
          setStatus('success');
          setMessage(data.message || 'E-posta adresiniz doğrulandı.');
          setTimeout(() => router.push('/auth/login?verified=1'), 2500);
        } else {
          setStatus('error');
          setMessage(data.error?.message || 'Doğrulama yapılamadı. Bağlantı geçersiz veya süresi dolmuş olabilir.');
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
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-shadow">
              <BookOpen className="h-6 w-6" />
            </div>
            <span className="font-display text-2xl font-bold text-stone-900">The Goal Lab</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-soft-lg p-6 sm:p-8 border border-stone-100">
          <div className="text-center">
            {status === 'loading' && (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto mb-4" />
                <h1 className="text-xl font-semibold text-stone-900 mb-2">E-posta doğrulanıyor</h1>
                <p className="text-stone-600">Lütfen bekleyin...</p>
              </>
            )}
            {status === 'success' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-primary-600" />
                  </div>
                </div>
                <h1 className="text-xl font-semibold text-stone-900 mb-2">Doğrulama başarılı</h1>
                <p className="text-stone-600 mb-6">{message}</p>
                <p className="text-sm text-stone-500">Giriş sayfasına yönlendiriliyorsunuz...</p>
              </>
            )}
            {status === 'error' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                    <XCircle className="h-8 w-8 text-amber-600" />
                  </div>
                </div>
                <h1 className="text-xl font-semibold text-stone-900 mb-2">Doğrulama başarısız</h1>
                <p className="text-stone-600 mb-6">{message}</p>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center w-full rounded-xl bg-primary-600 text-white py-3 px-4 font-medium hover:bg-primary-700 transition-colors"
                >
                  Giriş sayfasına git
                </Link>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-stone-500 mt-6">
          <Link href="/auth/login" className="text-primary-600 hover:underline">
            Giriş yap
          </Link>
          {' · '}
          <Link href="/" className="text-primary-600 hover:underline">
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
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
