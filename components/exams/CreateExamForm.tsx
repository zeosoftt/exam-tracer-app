/**
 * Create Exam Form Component
 * Modern form with validation
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createExamSchema } from '@/lib/validation/schemas';
import type { z } from 'zod';
import { BookOpen, ArrowLeft, Loader2, Calendar } from 'lucide-react';
import Link from 'next/link';

interface CreateExamFormProps {
  user: {
    id: string;
    role: string;
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

  const onSubmit = async (data: z.infer<typeof createExamSchema>) => {
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

      // Redirect to exam detail page
      router.push(`/dashboard/exams/${result.data.id}`);
      router.refresh();
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/exams" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Yeni Sınav Oluştur</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                Sınav Adı <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                placeholder="Örn: KPSS Genel Yetenek"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                2-100 karakter arası, sınavın açıklayıcı adı
              </p>
            </div>

            {/* Code Field */}
            <div>
              <label htmlFor="code" className="block text-sm font-semibold text-gray-900 mb-2">
                Sınav Kodu <span className="text-red-500">*</span>
              </label>
              <input
                id="code"
                type="text"
                {...register('code')}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors uppercase"
                placeholder="KPSS_GENEL_YETENEK"
                disabled={isLoading}
                style={{ textTransform: 'uppercase' }}
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Büyük harf, rakam, tire ve alt çizgi kullanılabilir (2-50 karakter)
              </p>
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                Açıklama
              </label>
              <textarea
                id="description"
                {...register('description')}
                rows={4}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none"
                placeholder="Sınav hakkında açıklayıcı bilgi..."
                disabled={isLoading}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Maksimum 1000 karakter
              </p>
            </div>

            {/* Date Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Start Date */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-semibold text-gray-900 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Başlangıç Tarihi
                </label>
                <input
                  id="startDate"
                  type="datetime-local"
                  {...register('startDate')}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                  disabled={isLoading}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                )}
              </div>

              {/* End Date */}
              <div>
                <label htmlFor="endDate" className="block text-sm font-semibold text-gray-900 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Bitiş Tarihi
                </label>
                <input
                  id="endDate"
                  type="datetime-local"
                  {...register('endDate')}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                  disabled={isLoading}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <Link
                href="/dashboard/exams"
                className={`px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors ${
                  isLoading ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                İptal
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/50 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
