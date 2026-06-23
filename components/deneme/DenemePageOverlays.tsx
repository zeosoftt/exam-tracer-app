'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { FlashMessage } from '@/components/ui';
import { DenemeTopicOnlyHero } from '@/components/deneme/denemeUi';
import { useDenemePage } from '@/components/deneme/hooks/useDenemePage';
import { DENEME_OPEN_ADD_EVENT } from '@/components/deneme/DenemeAddButtonTrigger';
import type { DenemePageInitialData } from '@/lib/deneme/loadDenemePageData';

const PEGEM_PANEL_MIN_H = 'min-h-[13.5rem]';

const PegemImportPanel = dynamic(
  () => import('@/components/deneme/PegemImportPanel').then((m) => m.PegemImportPanel),
  { ssr: false },
);

const DenemeAnalysisPanel = dynamic(
  () => import('@/components/deneme/DenemeAnalysisPanel').then((m) => m.DenemeAnalysisPanel),
  { ssr: false },
);

const DenemeAddFormModal = dynamic(
  () => import('@/components/deneme/DenemeAddFormModal').then((m) => m.DenemeAddFormModal),
  { ssr: false },
);

export function DenemePageOverlays({ initialData }: { initialData: DenemePageInitialData }) {
  const router = useRouter();
  const [formModalOpen, setFormModalOpen] = useState(false);

  const {
    topicProgressByExam,
    primaryTopicProgress,
    listError,
    featuresEnabled,
    exams,
    activeExamId,
    analysis,
    fetchAttempts,
    closeFormModal,
    formMessage,
    setFormMessage,
    handleFormSubmitSuccess,
    handlePremiumRequired,
    actionMessage,
  } = useDenemePage(initialData);

  useEffect(() => {
    const openAdd = () => setFormModalOpen(true);
    window.addEventListener(DENEME_OPEN_ADD_EVENT, openAdd);
    return () => window.removeEventListener(DENEME_OPEN_ADD_EVENT, openAdd);
  }, []);

  const handleCloseModal = () => {
    setFormModalOpen(false);
    closeFormModal();
  };

  const handleSubmitSuccess = () => {
    setFormModalOpen(false);
    handleFormSubmitSuccess();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pb-8 sm:px-6 lg:px-8">
      {actionMessage ? (
        <div className="mb-4">
          <FlashMessage type={actionMessage.type} variant="bordered">
            {actionMessage.text}
          </FlashMessage>
        </div>
      ) : null}

      {listError ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
          <span>{listError}</span>
          <button
            type="button"
            onClick={() => fetchAttempts(true)}
            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-red-50 dark:border-red-800 dark:bg-stone-900"
          >
            Tekrar dene
          </button>
        </div>
      ) : null}

      {formMessage ? (
        <div className="mb-4">
          <FlashMessage type={formMessage.type} variant="bordered">
            {formMessage.text}
          </FlashMessage>
        </div>
      ) : null}

      {featuresEnabled && primaryTopicProgress && primaryTopicProgress.total > 0 && !analysis ? (
        <DenemeTopicOnlyHero progress={primaryTopicProgress} />
      ) : null}

      {featuresEnabled && analysis ? (
        <div className="mt-6">
          <DenemeAnalysisPanel analysis={analysis} primaryTopicProgress={primaryTopicProgress} />
        </div>
      ) : null}

      {featuresEnabled ? (
        <div className={PEGEM_PANEL_MIN_H}>
          <PegemImportPanel
            exams={exams}
            activeExamId={activeExamId}
            onSaved={() => {
              void fetchAttempts(true);
              router.refresh();
            }}
          />
        </div>
      ) : null}

      {formModalOpen ? (
        <DenemeAddFormModal
          open={formModalOpen}
          onClose={handleCloseModal}
          featuresEnabled={featuresEnabled}
          exams={exams}
          activeExamId={activeExamId}
          topicProgressByExam={topicProgressByExam}
          onPremiumRequired={handlePremiumRequired}
          onSubmitSuccess={handleSubmitSuccess}
          onMessage={setFormMessage}
        />
      ) : null}
    </div>
  );
}
