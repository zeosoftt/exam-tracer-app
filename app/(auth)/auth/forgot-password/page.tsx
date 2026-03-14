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
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-shadow">
              <BookOpen className="h-6 w-6" />
            </div>
            <span className="font-display text-2xl font-bold text-stone-900">Exam Tracker</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-soft-lg p-6 sm:p-8 border border-stone-100">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-extrabold text-stone-900 mb-2">Şifremi Unuttum</h1>
            <p className="text-stone-600">E-posta adresinize şifre sıfırlama bağlantısı göndereceğiz</p>
          </div>

          {success ? (
            <div className="space-y-6">
              <div className="rounded-xl bg-green-50 border border-green-200 p-6">
                <div className="flex flex-col items-center gap-3">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                  <div className="text-center">
                    <p className="text-base font-semibold text-green-800 mb-2">
                      E-posta Gönderildi!
                    </p>
                    <p className="text-sm text-green-700">
                      Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.
                      Lütfen e-posta kutunuzu kontrol edin.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/auth/login"
                  className="w-full inline-flex items-center justify-center px-6 py-3.5 text-base font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all shadow-lg shadow-primary-500/30 hover:scale-[1.02]"
                >
                  Giriş Sayfasına Dön
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false);
                    setError(null);
                  }}
                  className="w-full text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
                >
                  Başka bir e-posta adresi dene
                </button>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-stone-900 mb-2">
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
                      className="w-full pl-10 rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm placeholder:text-stone-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
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
                  className="w-full relative inline-flex items-center justify-center px-6 py-3.5 text-base font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all shadow-lg shadow-primary-500/30 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                <p className="text-sm text-stone-600">
                  Şifrenizi hatırladınız mı?{' '}
                  <Link href="/auth/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
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
            className="inline-flex items-center text-sm text-stone-600 hover:text-stone-900 transition-colors"
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
