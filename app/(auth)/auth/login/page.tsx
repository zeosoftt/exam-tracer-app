/**
 * Login Page
 * Modern, Codecademy-inspired login UI
 */

'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validation/schemas';
import type { z } from 'zod';
import { BookOpen, Mail, Lock, Loader2, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const registered = searchParams.get('registered');
  const passwordReset = searchParams.get('passwordReset');
  const verified = searchParams.get('verified');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        // Handle different error types
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
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-extrabold text-stone-900 mb-2">Hoş Geldiniz</h1>
            <p className="text-stone-600">Hesabınıza giriş yapın</p>
          </div>

          {registered && (
            <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <p className="text-sm font-medium text-green-800">
                  Hesabınız oluşturuldu. E-posta adresinize gönderilen doğrulama linkine tıklayın, ardından giriş yapabilirsiniz.
                </p>
              </div>
            </div>
          )}

          {verified && (
            <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <p className="text-sm font-medium text-green-800">
                  E-posta adresiniz doğrulandı. Giriş yapabilirsiniz.
                </p>
              </div>
            </div>
          )}

          {passwordReset && (
            <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <p className="text-sm font-medium text-green-800">
                  Şifreniz başarıyla güncellendi! Yeni şifrenizle giriş yapabilirsiniz.
                </p>
              </div>
            </div>
          )}

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

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-stone-900 mb-2">
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
                  className="w-full pl-10 pr-10 rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm placeholder:text-stone-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
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

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Şifremi Unuttum
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative inline-flex items-center justify-center px-6 py-3.5 text-base font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
            <p className="text-sm text-stone-600">
              Hesabınız yok mu?{' '}
              <Link href="/onboarding" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                Ücretsiz kayıt olun
              </Link>
            </p>
          </div>
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>}>
      <LoginForm />
    </Suspense>
  );
}
