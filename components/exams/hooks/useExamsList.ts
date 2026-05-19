'use client';

import { useState, useEffect, useCallback, startTransition } from 'react';
import { fetchExamsList, type ExamListItem } from '@/lib/client-api/examsClient';

export function useExamsList() {
  const [exams, setExams] = useState<ExamListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const list = await fetchExamsList();
      startTransition(() => setExams(list));
    } catch {
      setError('Sınavlar yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { exams, isLoading, error, reload: load };
}
