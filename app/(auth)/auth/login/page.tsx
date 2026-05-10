/**
 * Login Page
 * Modern, Codecademy-inspired login UI
 */

'use client';

import { useState, Suspense } from 'react';
import { signIn, signOut, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validation/schemas';
import type { z } from 'zod';
import { AUTH_ERROR_CODES, SERVICE_UNAVAILABLE_COPY } from '@/config/constants';
import {
  BookOpen,
  Mail,
  Lock,
  Loader2,
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Send,
  CloudOff,
  RefreshCw,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [pendingVerifyEmail, setPendingVerifyEmail] = useState<string | null>(null);
  const [serviceOutage, setServiceOutage] = useState(false);
  const registered = searchParams.get('registered');
  const passwordReset = searchParams.get('passwordReset');
  const verified = searchParams.get('verified');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const emailValue = watch('email');

  const handleResendVerification = async () => {
    const email = pendingVerifyEmail || emailValue?.trim();
    if (!email) {
      setResendMessage('Önce e-posta adresinizi girin.');
      return;
    }
    setResendLoading(true);
    setResendMessage(null);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      setResendMessage(data.message || 'İstek alındı.');
    } catch {
      setResendMessage('İstek gönderilemedi. Daha sonra tekrar deneyin.');
    } finally {
      setResendLoading(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      setIsLoading(true);
      setError(null);
      setServiceOutage(false);
      setPendingVerifyEmail(null);
      setResendMessage(null);

      // OWASP / standart: Yeni girişte önceki oturum geçersiz kılınmalı (session replacement).
      // Sadece mevcut oturum varken signOut çağırıyoruz; böylece farklı hesapla girişte
      // yeni session oluşur, gereksiz signOut çağrısı yapılmaz.
      const session = await getSession();
      if (session?.user) {
        await signOut({ redirect: false });
      }

      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        remember: rememberMe ? 'true' : 'false',
        redirect: false,
      });

      if (result?.error) {
        if (result.error === AUTH_ERROR_CODES.DATABASE_UNAVAILABLE) {
          setServiceOutage(true);
          return;
        }
        if (result.error === AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED) {
          setPendingVerifyEmail(data.email.toLowerCase().trim());
          setError(
            'E-posta adresiniz henüz doğrulanmadı. Kayıt sırasında gönderilen bağlantıya tıklayın veya aşağıdan yeni doğrulama e-postası isteyin.'
          );
          return;
        }
        if (result.error === 'Configuration') {
          setError('Sunucu yapılandırma hatası. Lütfen yöneticiye başvurun.');
        } else if (result.error === 'CredentialsSignin') {
          setError('E-posta veya şifre hatalı');
        } else {
          setError('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
        }
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

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
            <h1 className="mb-2 font-display text-3xl font-extrabold text-stone-900 dark:text-stone-100">Hoş Geldiniz</h1>
            <p className="text-stone-600 dark:text-stone-400">Hesabınıza giriş yapın</p>
          </div>

          {registered && (
            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-950/40">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Hesabınız oluşturuldu. E-posta adresinize gönderilen doğrulama linkine tıklayın, ardından giriş yapabilirsiniz.
                </p>
              </div>
            </div>
          )}

          {verified && (
            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-950/40">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  E-posta adresiniz doğrulandı. Giriş yapabilirsiniz.
                </p>
              </div>
            </div>
          )}

          {passwordReset && (
            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-950/40">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Şifreniz başarıyla güncellendi! Yeni şifrenizle giriş yapabilirsiniz.
                </p>
              </div>
            </div>
          )}

          {serviceOutage && (
            <div
              className="mb-6 rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50 via-orange-50/40 to-stone-50/80 p-5 shadow-sm ring-1 ring-amber-100/60 dark:border-amber-900/40 dark:from-amber-950/50 dark:via-stone-900 dark:to-stone-950 dark:ring-amber-900/30"
              role="alert"
            >
              <div className="flex gap-4">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 shadow-inner"
                  aria-hidden
                >
                  <CloudOff className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-800/75">
                    {SERVICE_UNAVAILABLE_COPY.badge}
                  </p>
                  <h2 className="mt-1 font-display text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100">
                    {SERVICE_UNAVAILABLE_COPY.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                    {SERVICE_UNAVAILABLE_COPY.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-300/80 bg-white px-4 py-2.5 text-sm font-semibold text-amber-950 shadow-sm transition hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400/40 dark:border-amber-800 dark:bg-stone-900 dark:text-amber-100 dark:hover:bg-stone-800"
                  >
                    <RefreshCw className="h-4 w-4 text-amber-700" aria-hidden />
                    {SERVICE_UNAVAILABLE_COPY.retryLabel}
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 space-y-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/40">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
              {pendingVerifyEmail && (
                <div className="border-t border-red-100 pt-2 dark:border-red-900/40">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className="inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-white px-3 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50 disabled:opacity-50 dark:border-primary-800 dark:bg-stone-900 dark:text-primary-300 dark:hover:bg-stone-800"
                  >
                    {resendLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Doğrulama e-postasını tekrar gönder
                  </button>
                  {resendMessage && (
                    <p className="mt-2 text-xs text-stone-600 dark:text-stone-400">{resendMessage}</p>
                  )}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-stone-900 dark:text-stone-100">
                E-posta Adresi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="input w-full pl-10"
                  placeholder="ornek@email.com"
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-stone-900 dark:text-stone-100">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="input w-full pl-10 pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 transition-colors hover:text-stone-600 dark:hover:text-stone-300"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="h-4 w-4 rounded border-stone-300 text-primary-600 focus:ring-primary-500 dark:border-stone-600 dark:bg-stone-800"
              />
              <label htmlFor="remember" className="text-sm text-stone-700 dark:text-stone-300">
                Beni hatırla (bu cihazda daha uzun oturum)
              </label>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Şifremi Unuttum
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative inline-flex items-center justify-center px-6 py-3.5 text-base font-bold text-white bg-gradient-to-r from-primary-700 to-primary-600 rounded-xl hover:from-primary-800 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Hesabınız yok mu?{' '}
              <Link href="/onboarding" className="font-semibold text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                Ücretsiz kayıt olun
              </Link>
            </p>
            <p className="mt-3 text-sm text-stone-600 dark:text-stone-400">
              Girişte sorun mu var?{' '}
              <Link href="/destek" className="font-semibold text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                Destek
              </Link>
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-stone-50 text-stone-600 dark:bg-stone-950 dark:text-stone-400">
          Yükleniyor...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
