/**
 * Create Exam Form Component
 * Modern form with validation
 */

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createExamSchema } from '@/lib/validation/schemas';
import type { z } from 'zod';
import { BookOpen, ArrowLeft, Loader2, Calendar } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggleCompact } from '@/components/theme/ThemeToggleCompact';

interface CreateExamFormProps {
  user: {
    id: string;
    role?: string;
  };
}

export function CreateExamForm({ user: _user }: CreateExamFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof createExamSchema>>({
    resolver: zodResolver(createExamSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
    },
  });

  const onSubmit = useCallback(
    async (data: z.infer<typeof createExamSchema>) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/exams', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.error?.message || 'Sınav oluşturulurken bir hata oluştu');
          return;
        }

        router.push(`/dashboard/exams/${result.data.id}`);
        router.refresh();
      } catch {
        setError('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950/90">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/exams"
                className="text-stone-600 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">Yeni Sınav Oluştur</h1>
              </div>
            </div>
            <ThemeToggleCompact />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900/90">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/40">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-semibold text-stone-900 dark:text-stone-100">
                Sınav Adı <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className="input w-full rounded-xl px-4 py-3 text-sm"
                placeholder="Örn: KPSS Genel Yetenek"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
              )}
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                2-100 karakter arası, sınavın açıklayıcı adı
              </p>
            </div>

            {/* Code Field */}
            <div>
              <label htmlFor="code" className="mb-2 block text-sm font-semibold text-stone-900 dark:text-stone-100">
                Sınav Kodu <span className="text-red-500">*</span>
              </label>
              <input
                id="code"
                type="text"
                {...register('code')}
                className="input w-full rounded-xl px-4 py-3 text-sm uppercase"
                placeholder="KPSS_GENEL_YETENEK"
                disabled={isLoading}
                style={{ textTransform: 'uppercase' }}
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.code.message}</p>
              )}
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                Büyük harf, rakam, tire ve alt çizgi kullanılabilir (2-50 karakter)
              </p>
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="mb-2 block text-sm font-semibold text-stone-900 dark:text-stone-100">
                Açıklama
              </label>
              <textarea
                id="description"
                {...register('description')}
                rows={4}
                className="input w-full resize-none rounded-xl px-4 py-3 text-sm"
                placeholder="Sınav hakkında açıklayıcı bilgi..."
                disabled={isLoading}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
              )}
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                Maksimum 1000 karakter
              </p>
            </div>

            {/* Date Fields */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Start Date */}
              <div>
                <label htmlFor="startDate" className="mb-2 block text-sm font-semibold text-stone-900 dark:text-stone-100">
                  <Calendar className="mr-1 inline h-4 w-4" />
                  Başlangıç Tarihi
                </label>
                <input
                  id="startDate"
                  type="datetime-local"
                  {...register('startDate')}
                  className="input w-full rounded-xl px-4 py-3 text-sm"
                  disabled={isLoading}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.startDate.message}</p>
                )}
              </div>

              {/* End Date */}
              <div>
                <label htmlFor="endDate" className="mb-2 block text-sm font-semibold text-stone-900 dark:text-stone-100">
                  <Calendar className="mr-1 inline h-4 w-4" />
                  Bitiş Tarihi
                </label>
                <input
                  id="endDate"
                  type="datetime-local"
                  {...register('endDate')}
                  className="input w-full rounded-xl px-4 py-3 text-sm"
                  disabled={isLoading}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 border-t border-stone-200 pt-6 dark:border-stone-800">
              <Link
                href="/dashboard/exams"
                className={`rounded-xl border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700 ${
                  isLoading ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                İptal
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition-all hover:from-primary-800 hover:to-primary-700 disabled:cursor-not-allowed disabled:opacity-50 dark:shadow-primary-900/40"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    Sınav Oluştur
                    <BookOpen className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
