/**
 * Exams List Component
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, Calendar, Users } from 'lucide-react';

interface Exam {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export function ExamsList({ user }: { user: { id: string; role: string } }) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExams() {
      try {
        const response = await fetch('/api/exams');
        if (!response.ok) {
          throw new Error('Failed to fetch exams');
        }
        const data = await response.json();
        setExams(data.data || []);
      } catch (err) {
        setError('Sınavlar yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    }

    fetchExams();
  }, []);

  const canCreateExam = user.role === 'ADMIN' || user.role === 'INSTITUTION_ADMIN';

  return (
    <div className="min-h-screen bg-secondary-50">
      <header className="border-b border-secondary-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/dashboard" className="mr-4">
                <BookOpen className="h-6 w-6 text-primary-600" />
              </Link>
              <h1 className="text-xl font-bold text-secondary-900">Sınavlar</h1>
            </div>
            {canCreateExam && (
              <Link href="/dashboard/exams/new" className="btn-primary flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Yeni Sınav
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 w-3/4 bg-secondary-200 rounded"></div>
                <div className="mt-2 h-3 w-full bg-secondary-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="card text-center">
            <p className="text-danger-600">{error}</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="card text-center">
            <BookOpen className="mx-auto h-12 w-12 text-secondary-400" />
            <h3 className="mt-4 text-lg font-semibold text-secondary-900">Henüz sınav yok</h3>
            <p className="mt-2 text-secondary-600">Henüz size atanmış bir sınav bulunmuyor.</p>
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
                    <h3 className="text-lg font-semibold text-secondary-900">{exam.name}</h3>
                    <p className="mt-1 text-sm text-secondary-500">{exam.code}</p>
                    {exam.description && (
                      <p className="mt-2 text-sm text-secondary-600 line-clamp-2">
                        {exam.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`ml-2 rounded-full px-2 py-1 text-xs font-medium ${
                      exam.status === 'ACTIVE'
                        ? 'bg-success-100 text-success-700'
                        : 'bg-secondary-100 text-secondary-700'
                    }`}
                  >
                    {exam.status === 'ACTIVE' ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                {(exam.startDate || exam.endDate) && (
                  <div className="mt-4 flex items-center gap-4 text-sm text-secondary-600">
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
