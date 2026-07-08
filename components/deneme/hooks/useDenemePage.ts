'use client';

import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteDenemeAttempt } from '@/lib/client-api/denemeClient';
import { computeDenemeAnalysis } from '@/lib/deneme/computeDenemeAnalysis';
import type { DenemePageInitialData } from '@/lib/deneme/loadDenemePageData';
import { useDenemePageBootstrap } from '@/components/deneme/hooks/useDenemePageBootstrap';
import type { DenemeAttemptListItem } from '@/lib/client-api/denemeClient';

export function useDenemePage(initialData?: DenemePageInitialData) {
  const router = useRouter();
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deletingAttemptId, setDeletingAttemptId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    attempts,
    topicProgressByExam,
    primaryTopicProgress,
    loading,
    listError,
    denemeAdvanced,
    canViewDenemeDetail,
    featuresEnabled,
    exams,
    activeExamId,
    fetchAttempts,
    prependAttempt,
  } = useDenemePageBootstrap(initialData);

  const handlePremiumRequired = useCallback(() => {
    void fetchAttempts(true);
  }, [fetchAttempts]);

  const closeFormModal = useCallback(() => {
    setFormModalOpen(false);
    setFormMessage(null);
  }, []);

  const handleFormSubmitSuccess = useCallback(
    (attempt?: DenemeAttemptListItem) => {
      setFormModalOpen(false);
      if (attempt) {
        prependAttempt(attempt);
      }
      router.refresh();
      void fetchAttempts(true);
    },
    [fetchAttempts, prependAttempt, router],
  );

  const analysisImmediate = useMemo(() => computeDenemeAnalysis(attempts), [attempts]);
  const analysis = useDeferredValue(analysisImmediate);
  const analysisAvg = analysis?.avg ?? null;

  const handleDeleteAttempt = useCallback(
    async (attemptId: string) => {
      if (!confirm('Bu deneme kaydını silmek istediğinize emin misiniz?')) return;

      setDeletingAttemptId(attemptId);
      setActionMessage(null);

      const result = await deleteDenemeAttempt(attemptId);
      setDeletingAttemptId(null);

      if (result.ok) {
        setActionMessage({ type: 'success', text: 'Deneme kaydı silindi.' });
        await fetchAttempts(true);
        router.refresh();
        return;
      }

      setActionMessage({ type: 'error', text: result.error });
    },
    [fetchAttempts, router],
  );

  return {
    attempts,
    topicProgressByExam,
    primaryTopicProgress,
    loading,
    listError,
    denemeAdvanced,
    canViewDenemeDetail,
    featuresEnabled,
    exams,
    activeExamId,
    analysis,
    analysisAvg,
    fetchAttempts,
    prependAttempt,
    formModalOpen,
    setFormModalOpen,
    closeFormModal,
    formMessage,
    setFormMessage,
    handleFormSubmitSuccess,
    handlePremiumRequired,
    deletingAttemptId,
    handleDeleteAttempt,
    actionMessage,
  };
}
