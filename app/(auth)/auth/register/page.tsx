/**
 * Register Page
 * Modern, Codecademy-inspired registration UI
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/lib/validation/schemas';
import type { z } from 'zod';
import { BookOpen, ArrowLeft, Loader2, User, Mail, Lock, CheckCircle, Eye, EyeOff } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [onboardingData, setOnboardingData] = useState<{
    userType?: string;
    examId?: string;
    examCode?: string;
    examName?: string;
    targetScore?: number;
    dailyStudyHours?: number;
    acquisitionSource?: string | null;
    acquisitionSourceDetail?: string | null;
  } | null>(null);

  useEffect(() => {
    // Get onboarding data from URL params or sessionStorage
    const userType = searchParams.get('userType');
    const examId = searchParams.get('examId');
    const targetScore = searchParams.get('targetScore');
    const dailyStudyHours = searchParams.get('dailyStudyHours');
    
    // Also check sessionStorage
    const stored = sessionStorage.getItem('onboarding');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setOnboardingData({
          userType: userType || data.userType,
          examId: examId || data.examId,
          examCode: data.examCode,
          examName: data.examName,
          targetScore: targetScore ? parseInt(targetScore) : data.targetScore,
          dailyStudyHours: dailyStudyHours ? parseInt(dailyStudyHours) : data.dailyStudyHours,
          acquisitionSource: data.acquisitionSource ?? undefined,
          acquisitionSourceDetail: data.acquisitionSourceDetail ?? undefined,
        });
      } catch (e) {
        // Ignore parse errors
      }
    } else if (userType || examId) {
      setOnboardingData({ 
        userType: userType || undefined, 
        examId: examId || undefined,
        targetScore: targetScore ? parseInt(targetScore) : undefined,
        dailyStudyHours: dailyStudyHours ? parseInt(dailyStudyHours) : undefined,
      });
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    try {
      setIsLoading(true);
      setError(null);

      // Include onboarding data in registration
      const registrationData = {
        ...data,
        targetScore: onboardingData?.targetScore,
        dailyStudyHours: onboardingData?.dailyStudyHours,
        examCode: onboardingData?.examCode,
        examName: onboardingData?.examName,
        acquisitionSource: onboardingData?.acquisitionSource ?? undefined,
        acquisitionSourceDetail: onboardingData?.acquisitionSourceDetail ?? undefined,
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error?.message || 'Kayıt işlemi başarısız oldu');
        return;
      }

      // Clear onboarding data
      sessionStorage.removeItem('onboarding');

      // If exam was selected during onboarding, redirect to dashboard
      if (onboardingData?.examId) {
        router.push('/dashboard?examAssigned=true');
      } else {
        router.push('/auth/login?registered=true');
      }
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
            <h1 className="mb-2 font-display text-3xl font-extrabold text-stone-900 dark:text-stone-100">Hesap Oluştur</h1>
            <p className="text-stone-600 dark:text-stone-400">The Goal Lab&apos;a katılın ve hedef ve sınav takibinize başlayın</p>
            {onboardingData?.examName && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2 dark:border-primary-800 dark:bg-primary-950/40">
                <CheckCircle className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                <span className="text-sm font-medium text-primary-900 dark:text-primary-100">
                  <strong>{onboardingData.examName}</strong> için kayıt oluyorsunuz
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/40">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="mb-2 block text-sm font-semibold text-stone-900 dark:text-stone-100">
                  Ad
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-5 w-5 text-stone-400" />
                  </div>
                  <input
                    id="firstName"
                    type="text"
                    {...register('firstName')}
                    className="input w-full pl-10"
                    placeholder="Adınız"
                    disabled={isLoading}
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="mb-2 block text-sm font-semibold text-stone-900 dark:text-stone-100">
                  Soyad
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-5 w-5 text-stone-400" />
                  </div>
                  <input
                    id="lastName"
                    type="text"
                    {...register('lastName')}
                    className="input w-full pl-10"
                    placeholder="Soyadınız"
                    disabled={isLoading}
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

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

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-stone-900 dark:text-stone-100">
                Şifre
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="input w-full pl-10 pr-10"
                  placeholder="••••••••"
                  autoComplete="new-password"
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
              <p className="mt-2 text-xs text-stone-500 leading-relaxed">
                En az 8 karakter, büyük harf, küçük harf ve rakam içermelidir
              </p>
            </div>

            {onboardingData && (onboardingData.targetScore || onboardingData.dailyStudyHours) && (
              <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
                <p className="text-xs font-semibold text-stone-700 mb-2">Hedefleriniz:</p>
                <div className="space-y-1 text-xs text-stone-600">
                  {onboardingData.targetScore && (
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                      <span>Hedef Puan: <strong>{onboardingData.targetScore}</strong></span>
                    </div>
                  )}
                  {onboardingData.dailyStudyHours && (
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-accent-500 rounded-full"></div>
                      <span>Günlük Çalışma: <strong>{onboardingData.dailyStudyHours} saat</strong></span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative inline-flex items-center justify-center px-6 py-3.5 text-base font-bold text-white bg-gradient-to-r from-primary-700 to-primary-600 rounded-xl hover:from-primary-800 hover:to-primary-700 transition-all shadow-lg shadow-primary-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Hesap Oluşturuluyor...
                </>
              ) : (
                <>
                  Hesap Oluştur
                  <BookOpen className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Zaten hesabınız var mı?{' '}
              <Link
                href="/auth/login"
                className="font-semibold text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Giriş yapın
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

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-stone-50 text-stone-600 dark:bg-stone-950 dark:text-stone-400">
          Yükleniyor...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
