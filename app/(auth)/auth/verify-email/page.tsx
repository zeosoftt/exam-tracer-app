/**
 * E-posta doğrulama — 6 haneli kod ile
 */

'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Loader2, CheckCircle, Send } from 'lucide-react';
import { postResendVerification, postVerifyEmail, fetchDevVerificationCode } from '@/lib/client-api/authForms';
import { normalizeVerificationCode } from '@/lib/auth/verificationCodeFormat';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email')?.trim() ?? '';

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setDevCode(null);
      return;
    }
    let cancelled = false;
    void fetchDevVerificationCode(trimmed).then((code) => {
      if (!cancelled) setDevCode(code);
    });
    return () => {
      cancelled = true;
    };
  }, [email]);

  const handleVerify = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedEmail = email.trim().toLowerCase();
      const normalizedCode = normalizeVerificationCode(code);

      if (!trimmedEmail) {
        setStatus('error');
        setMessage('E-posta adresinizi girin.');
        return;
      }
      if (normalizedCode.length !== 6) {
        setStatus('error');
        setMessage('6 haneli doğrulama kodunu girin.');
        return;
      }

      setStatus('loading');
      setMessage('');
      setResendMessage(null);

      try {
        const r = await postVerifyEmail({ email: trimmedEmail, code: normalizedCode });
        if (r.ok && r.success) {
          setStatus('success');
          setMessage(r.message || 'E-posta adresiniz doğrulandı.');
          setTimeout(() => router.push('/auth/login?verified=1'), 2500);
        } else {
          setStatus('error');
          setMessage(r.errorMessage || 'Doğrulama yapılamadı.');
        }
      } catch {
        setStatus('error');
        setMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    },
    [email, code, router],
  );

  const handleResend = useCallback(async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setResendMessage('Önce e-posta adresinizi girin.');
      return;
    }
    setResendLoading(true);
    setResendMessage(null);
    try {
      const { message: msg } = await postResendVerification(trimmedEmail);
      setResendMessage(msg || 'Yeni kod gönderildi.');
      const fresh = await fetchDevVerificationCode(trimmedEmail);
      if (fresh) setDevCode(fresh);
    } catch {
      setResendMessage('Kod gönderilemedi. Daha sonra tekrar deneyin.');
    } finally {
      setResendLoading(false);
    }
  }, [email]);

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
          {status === 'success' ? (
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-950/60">
                  <CheckCircle className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
              <h1 className="mb-2 text-xl font-semibold text-stone-900 dark:text-stone-100">Doğrulama başarılı</h1>
              <p className="mb-6 text-stone-600 dark:text-stone-400">{message}</p>
              <p className="text-sm text-stone-500 dark:text-stone-400">Giriş sayfasına yönlendiriliyorsunuz...</p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <h1 className="mb-2 text-xl font-semibold text-stone-900 dark:text-stone-100">E-postanızı doğrulayın</h1>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  Kayıt sonrası e-postanıza gönderilen 6 haneli kodu aşağıya girin.
                </p>
              </div>

              {devCode ? (
                <div className="mb-6 rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-center dark:border-amber-800 dark:bg-amber-950/40">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300">
                    Local geliştirme
                  </p>
                  <p className="mt-1 text-sm text-amber-900 dark:text-amber-100">
                    E-posta gitmediyse doğrulama kodunuz:
                  </p>
                  <p className="mt-2 font-mono text-3xl font-bold tracking-[0.35em] text-amber-950 dark:text-amber-50">
                    {devCode}
                  </p>
                  <p className="mt-2 text-xs text-amber-800/80 dark:text-amber-200/80">
                    Terminalde de görünür. Gerçek e-posta için `.env.local` içine `RESEND_API_KEY` ekleyin.
                  </p>
                </div>
              ) : null}

              <form onSubmit={(e) => void handleVerify(e)} className="space-y-4">
                <div>
                  <label htmlFor="verify-email" className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
                    E-posta
                  </label>
                  <input
                    id="verify-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
                    placeholder="ornek@email.com"
                    disabled={status === 'loading'}
                  />
                </div>

                <div>
                  <label htmlFor="verify-code" className="mb-1.5 block text-sm font-medium text-stone-700 dark:text-stone-300">
                    Doğrulama kodu
                  </label>
                  <input
                    id="verify-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(normalizeVerificationCode(e.target.value))}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-center text-2xl font-bold tracking-[0.35em] text-stone-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
                    placeholder="000000"
                    disabled={status === 'loading'}
                  />
                </div>

                {status === 'error' && message ? (
                  <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
                    {message}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-3 font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Doğrulanıyor...
                    </>
                  ) : (
                    'Doğrula'
                  )}
                </button>
              </form>

              <div className="mt-6 border-t border-stone-100 pt-5 dark:border-stone-800">
                <p className="mb-3 text-center text-sm text-stone-500 dark:text-stone-400">Kod gelmedi mi?</p>
                <button
                  type="button"
                  onClick={() => void handleResend()}
                  disabled={resendLoading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50 disabled:opacity-60 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
                >
                  {resendLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Yeni kod gönder
                </button>
                {resendMessage ? (
                  <p className="mt-3 text-center text-sm text-stone-600 dark:text-stone-400">{resendMessage}</p>
                ) : null}
              </div>
            </>
          )}
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
