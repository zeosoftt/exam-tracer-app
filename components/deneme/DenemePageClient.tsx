'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { DenemeDashboardPanel } from '@/components/deneme/DenemeDashboardPanel';
import { DenemeAddPanel } from '@/components/deneme/DenemeAddPanel';
import { DENEME_OPEN_ADD_EVENT } from '@/components/deneme/DenemeAddButtonTrigger';
import { useDenemePageContext } from '@/components/deneme/DenemePageContext';
import type { DenemeAttemptListItem } from '@/lib/client-api/denemeClient';

const DenemeAddFormModal = dynamic(
  () => import('@/components/deneme/DenemeAddFormModal').then((m) => m.DenemeAddFormModal),
  { ssr: false },
);

export function DenemePageSummary() {
  const {
    attempts,
    primaryTopicProgress,
    listError,
    featuresEnabled,
    analysis,
    fetchAttempts,
    actionMessage,
  } = useDenemePageContext();

  if (!featuresEnabled) return null;

  return (
    <DenemeDashboardPanel
      analysis={analysis}
      attemptsCount={attempts.length}
      primaryTopicProgress={primaryTopicProgress}
      listError={listError}
      actionMessage={actionMessage}
      onRetryList={() => void fetchAttempts(true)}
    />
  );
}

export function DenemePageAdd() {
  const router = useRouter();
  const { featuresEnabled, exams, activeExamId, formMessage, fetchAttempts, prependAttempt } =
    useDenemePageContext();

  if (!featuresEnabled) return null;

  const handleImportSaved = (attempt: DenemeAttemptListItem) => {
    prependAttempt(attempt);
    router.refresh();
    void fetchAttempts(true);
  };

  return (
    <DenemeAddPanel
      exams={exams}
      activeExamId={activeExamId}
      formMessage={formMessage}
      onImportSaved={handleImportSaved}
    />
  );
}

export function DenemePageModal() {
  const {
    featuresEnabled,
    exams,
    activeExamId,
    topicProgressByExam,
    formModalOpen,
    closeFormModal,
    handleFormSubmitSuccess,
    handlePremiumRequired,
    setFormMessage,
    setFormModalOpen,
  } = useDenemePageContext();

  useEffect(() => {
    const openAdd = () => setFormModalOpen(true);
    window.addEventListener(DENEME_OPEN_ADD_EVENT, openAdd);
    return () => window.removeEventListener(DENEME_OPEN_ADD_EVENT, openAdd);
  }, [setFormModalOpen]);

  if (!featuresEnabled || !formModalOpen) return null;

  return (
    <DenemeAddFormModal
      open={formModalOpen}
      onClose={closeFormModal}
      featuresEnabled={featuresEnabled}
      exams={exams}
      activeExamId={activeExamId}
      topicProgressByExam={topicProgressByExam}
      onPremiumRequired={handlePremiumRequired}
      onSubmitSuccess={handleFormSubmitSuccess}
      onMessage={setFormMessage}
    />
  );
}
