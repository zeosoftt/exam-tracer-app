/**
 * Forgot Password Page
 * Request password reset via email
 */

'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen, Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
});

function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email.toLowerCase() }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
        return;
      }

      setSuccess(true);
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
            <h1 className="mb-2 font-display text-3xl font-extrabold text-stone-900 dark:text-stone-100">Şifremi Unuttum</h1>
            <p className="text-stone-600 dark:text-stone-400">E-posta adresinize şifre sıfırlama bağlantısı göndereceğiz</p>
          </div>

          {success ? (
            <div className="space-y-6">
              <div className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-900/50 dark:bg-green-950/40">
                <div className="flex flex-col items-center gap-3">
                  <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                  <div className="text-center">
                    <p className="mb-2 text-base font-semibold text-green-800 dark:text-green-200">
                      E-posta Gönderildi!
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300/90">
                      Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.
                      Lütfen e-posta kutunuzu kontrol edin.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/auth/login"
                  className="w-full inline-flex items-center justify-center px-6 py-3.5 text-base font-bold text-white bg-gradient-to-r from-primary-700 to-primary-600 rounded-xl hover:from-primary-800 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/30 hover:scale-[1.02]"
                >
                  Giriş Sayfasına Dön
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false);
                    setError(null);
                  }}
                  className="w-full text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
                >
                  Başka bir e-posta adresi dene
                </button>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/40">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-semibold text-stone-900 dark:text-stone-100">
                    E-posta Adresi
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative inline-flex items-center justify-center px-6 py-3.5 text-base font-bold text-white bg-gradient-to-r from-primary-700 to-primary-600 rounded-xl hover:from-primary-800 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/30 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    'Şifre Sıfırlama Bağlantısı Gönder'
                  )}
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  Şifrenizi hatırladınız mı?{' '}
                  <Link
                    href="/auth/login"
                    className="font-semibold text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Giriş yapın
                  </Link>
                </p>
              </div>
            </>
          )}
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

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-stone-50 text-stone-600 dark:bg-stone-950 dark:text-stone-400">
          Yükleniyor...
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
