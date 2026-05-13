/**
 * Exams List Component
 */

'use client';

import Link from 'next/link';
import { BookOpen, Plus, Calendar } from 'lucide-react';
import { ThemeToggleCompact } from '@/components/theme/ThemeToggleCompact';
import { useExamsList } from '@/components/exams/hooks/useExamsList';

export function ExamsList({ user }: { user: { id: string; role?: string } }) {
  const { exams, isLoading, error } = useExamsList();

  const canCreateExam = user.role === 'ADMIN' || user.role === 'INSTITUTION_ADMIN';

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="border-b border-stone-200 bg-white/90 backdrop-blur-sm dark:border-stone-800 dark:bg-stone-950/90">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-3">
            <div className="flex items-center">
              <Link href="/dashboard" className="mr-4">
                <BookOpen className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </Link>
              <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">Sınavlar</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggleCompact />
              {canCreateExam && (
                <Link href="/dashboard/exams/new" className="btn-primary flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Yeni Sınav
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 w-3/4 rounded bg-stone-200 dark:bg-stone-700"></div>
                <div className="mt-2 h-3 w-full rounded bg-stone-200 dark:bg-stone-700"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="card text-center">
            <p className="text-danger-600">{error}</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="card text-center">
            <BookOpen className="mx-auto h-12 w-12 text-stone-400 dark:text-stone-600" />
            <h3 className="mt-4 text-lg font-semibold text-stone-900 dark:text-stone-100">Henüz sınav yok</h3>
            <p className="mt-2 text-stone-600 dark:text-stone-400">Henüz size atanmış bir sınav bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => (
              <Link
                key={exam.id}
                href={`/dashboard/exams/${exam.id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">{exam.name}</h3>
                    <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{exam.code}</p>
                    {exam.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-stone-600 dark:text-stone-400">
                        {exam.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`ml-2 rounded-full px-2 py-1 text-xs font-medium ${
                      exam.status === 'ACTIVE'
                        ? 'bg-success-100 text-success-700 dark:bg-success-950/40 dark:text-success-300'
                        : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                    }`}
                  >
                    {exam.status === 'ACTIVE' ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                {(exam.startDate || exam.endDate) && (
                  <div className="mt-4 flex items-center gap-4 text-sm text-stone-600 dark:text-stone-400">
                    {exam.startDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(exam.startDate).toLocaleDateString('tr-TR')}</span>
                      </div>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
