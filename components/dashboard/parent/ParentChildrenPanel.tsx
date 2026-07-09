'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { PageSectionCard } from '@/components/ui';
import { fetchParentChildren } from '@/lib/client-api/parentClient';
import type { LinkedStudentSummary } from '@/lib/parent/listLinkedStudents';

function StudentRow({ student }: { student: LinkedStudentSummary }) {
  const pct =
    student.totalTopics > 0
      ? Math.round((student.completedTopics / student.totalTopics) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-stone-200 bg-stone-50/80 p-4 dark:border-stone-700 dark:bg-stone-900/60 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-stone-900 dark:text-stone-100">
          {student.firstName} {student.lastName}
        </p>
        <p className="text-sm text-stone-500 dark:text-stone-400">{student.email}</p>
      </div>
      <div className="text-sm text-stone-600 dark:text-stone-300">
        <span className="font-medium text-primary-700 dark:text-primary-300">{pct}%</span>
        <span className="text-stone-500 dark:text-stone-400">
          {' '}
          · {student.completedTopics}/{student.totalTopics} konu
        </span>
      </div>
    </div>
  );
}

export function ParentChildrenPanel() {
  const [students, setStudents] = useState<LinkedStudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchParentChildren();
      setStudents(list);
    } catch {
      setError('Öğrenci listesi yüklenemedi.');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <PageSectionCard
      title="Bağlı öğrenciler"
      icon={<Users className="h-6 w-6 text-violet-600 dark:text-violet-400" />}
      iconClassName="bg-violet-100 dark:bg-violet-950/40"
      description="Veli olarak bağlandığınız öğrencilerin ilerleme özeti."
      className="mb-8"
    >
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-stone-500 dark:text-stone-400">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Yükleniyor...
        </div>
      ) : error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : (
        <div className="space-y-3">
          {students.map((s) => (
            <StudentRow key={s.id} student={s} />
          ))}
        </div>
      )}
    </PageSectionCard>
  );
}
