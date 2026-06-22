'use client';

import { useCallback, useEffect, useMemo, useState, startTransition } from 'react';
import { fetchDenemeSiteFlags, fetchDenemeDetailAccess } from '@/lib/client-api/denemeClient';
import { computeDenemeAnalysis } from '@/lib/deneme/computeDenemeAnalysis';
import { useDenemeAttemptsList } from '@/components/deneme/hooks/useDenemeAttemptsList';
import {
  useDenemeExamBootstrap,
  useDenemeTopicProgressRefresh,
} from '@/components/deneme/hooks/useDenemeExamBootstrap';
import { useDenemeForm } from '@/components/deneme/hooks/useDenemeForm';

export function useDenemePage() {
  const [denemeAdvanced, setDenemeAdvanced] = useState<boolean | null>(null);
  const [canViewDenemeDetail, setCanViewDenemeDetail] = useState(false);

  const markFeatureDisabled = useCallback(() => {
    startTransition(() => setDenemeAdvanced(false));
  }, []);

  const {
    attempts,
    topicProgressByExam,
    primaryTopicProgress,
    setTopicProgressByExam,
    setPrimaryTopicProgress,
    loading,
    listError,
    fetchAttempts,
  } = useDenemeAttemptsList(markFeatureDisabled);

  useEffect(() => {
    fetchDenemeSiteFlags()
      .then((advanced) => startTransition(() => setDenemeAdvanced(advanced)))
      .catch(() => startTransition(() => setDenemeAdvanced(true)));
  }, []);

  useEffect(() => {
    fetchDenemeDetailAccess()
      .then((allowed) => startTransition(() => setCanViewDenemeDetail(allowed)))
      .catch(() => startTransition(() => setCanViewDenemeDetail(false)));
  }, []);

  const featuresEnabled = denemeAdvanced !== false;
  const { exams, activeExamId, examIdsKey } = useDenemeExamBootstrap(featuresEnabled);

  useDenemeTopicProgressRefresh(
    featuresEnabled,
    examIdsKey,
    setTopicProgressByExam,
    setPrimaryTopicProgress,
  );

  const handlePremiumRequired = useCallback(() => {
    // denemePremiumRequired is set inside useDenemeForm via postDenemeAttempt response
    // list hook owns premium state from GET; form POST may also trigger — refetch list
    fetchAttempts(true);
  }, [fetchAttempts]);

  const denemeForm = useDenemeForm({
    featuresEnabled,
    exams,
    activeExamId,
    onPremiumRequired: handlePremiumRequired,
    onSubmitSuccess: () => fetchAttempts(true),
  });

  const analysis = useMemo(() => computeDenemeAnalysis(attempts), [attempts]);
  const analysisAvg = analysis?.avg ?? null;

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
    ...denemeForm,
  };
}
