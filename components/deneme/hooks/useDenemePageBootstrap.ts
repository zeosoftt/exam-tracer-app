'use client';

import { useCallback, useEffect, useRef, useState, startTransition } from 'react';
import {
  fetchDenemeAttempts,
  fetchDenemeDetailAccess,
  fetchDenemeSiteFlags,
  loadDenemeFormBootstrap,
  type DenemeAttemptListItem,
  type DenemeFetchResult,
  type ExamTopicProgress,
  type PrimaryTopicProgress,
} from '@/lib/client-api/denemeClient';
import type { DenemePageInitialData } from '@/lib/deneme/loadDenemePageData';
import { sortDenemeAttemptsByDateDesc } from '@/lib/deneme/sortDenemeAttempts';
import { invalidateRequestCache } from '@/lib/client-api/requestCache';
import type { ExamOption } from '@/components/deneme/hooks/denemeFormTypes';

type BootstrapState = {
  attempts: DenemeAttemptListItem[];
  topicProgressByExam: Record<string, ExamTopicProgress>;
  primaryTopicProgress: PrimaryTopicProgress | null;
  loading: boolean;
  listError: string | null;
  denemeAdvanced: boolean | null;
  canViewDenemeDetail: boolean;
  exams: ExamOption[];
  activeExamId: string | null;
};

const emptyState: BootstrapState = {
  attempts: [],
  topicProgressByExam: {},
  primaryTopicProgress: null,
  loading: true,
  listError: null,
  denemeAdvanced: null,
  canViewDenemeDetail: false,
  exams: [],
  activeExamId: null,
};

const failedAttemptsResult: DenemeFetchResult = {
  ok: false,
  error: 'Deneme kayıtları yüklenemedi.',
};

function stateFromInitialData(data: DenemePageInitialData): BootstrapState {
  return {
    attempts: sortDenemeAttemptsByDateDesc(data.attempts),
    topicProgressByExam: data.topicProgressByExam,
    primaryTopicProgress: data.primaryTopicProgress,
    loading: false,
    listError: null,
    denemeAdvanced: data.denemeAdvanced,
    canViewDenemeDetail: data.canViewDenemeDetail,
    exams: data.exams,
    activeExamId: data.activeExamId,
  };
}

function applyAttemptsResult(
  result: DenemeFetchResult,
  canViewDetail: boolean,
  bootstrap: { exams: ExamOption[]; activeExamId: string | null },
  advanced: boolean,
): Partial<BootstrapState> {
  if (result.ok) {
    return {
      attempts: sortDenemeAttemptsByDateDesc(result.data),
      topicProgressByExam: result.topicProgressByExam,
      primaryTopicProgress: result.primaryTopicProgress,
      loading: false,
      listError: null,
      denemeAdvanced: advanced ? true : false,
      canViewDenemeDetail: canViewDetail,
      exams: bootstrap.exams,
      activeExamId: bootstrap.activeExamId,
    };
  }

  return {
    denemeAdvanced: result.featureDisabled ? false : advanced ? true : false,
    canViewDenemeDetail: canViewDetail,
    exams: bootstrap.exams,
    activeExamId: bootstrap.activeExamId,
    listError: result.error,
    loading: false,
  };
}

function enrichTopicProgressInBackground(
  examIds: string[],
  apply: (result: DenemeFetchResult) => void,
) {
  void fetchDenemeAttempts(50, examIds).then((enriched) => {
    if (enriched.ok) {
      startTransition(() => apply(enriched));
    }
  });
}

export function useDenemePageBootstrap(
  initialData?: DenemePageInitialData,
  onFeatureDisabled?: () => void,
) {
  const [state, setState] = useState<BootstrapState>(() =>
    initialData ? stateFromInitialData(initialData) : emptyState,
  );
  const fetchInFlightRef = useRef(false);
  const lastFetchAtRef = useRef(initialData ? Date.now() : 0);
  const skipInitialFetchRef = useRef(!!initialData);

  const loadPage = useCallback(
    async (force = false) => {
      const now = Date.now();
      if (!force && now - lastFetchAtRef.current < 10_000) return;
      if (fetchInFlightRef.current) return;

      fetchInFlightRef.current = true;
      if (force) {
        invalidateRequestCache('/api/deneme');
        setState((prev) => ({ ...prev, listError: null }));
      }

      try {
        const [advanced, canViewDetail, bootstrap, result] = await Promise.all([
          fetchDenemeSiteFlags().catch(() => true),
          fetchDenemeDetailAccess().catch(() => false),
          loadDenemeFormBootstrap().catch(() => ({ exams: [] as ExamOption[], activeExamId: null })),
          fetchDenemeAttempts(50).catch(() => failedAttemptsResult),
        ]);

        if (!advanced) {
          onFeatureDisabled?.();
          startTransition(() => {
            setState((prev) => ({
              ...prev,
              denemeAdvanced: false,
              canViewDenemeDetail: canViewDetail,
              exams: bootstrap.exams,
              activeExamId: bootstrap.activeExamId,
              attempts: [],
              topicProgressByExam: {},
              primaryTopicProgress: null,
              listError: null,
              loading: false,
            }));
          });
          lastFetchAtRef.current = Date.now();
          return;
        }

        if (result.ok) {
          const nextState = applyAttemptsResult(result, canViewDetail, bootstrap, true) as BootstrapState;
          if (force) {
            setState(nextState);
          } else {
            startTransition(() => {
              setState(nextState);
            });
          }

          const examIds = [
            ...new Set([
              ...result.data.map((a) => a.examId),
              ...(bootstrap.activeExamId ? [bootstrap.activeExamId] : []),
            ]),
          ];
          const hasProgress = Object.keys(result.topicProgressByExam).length > 0;
          if (examIds.length > 0 && !hasProgress) {
            enrichTopicProgressInBackground(examIds, (enriched) => {
              setState((prev) => ({
                ...prev,
                topicProgressByExam: enriched.ok ? enriched.topicProgressByExam : prev.topicProgressByExam,
                primaryTopicProgress: enriched.ok ? enriched.primaryTopicProgress : prev.primaryTopicProgress,
              }));
            });
          }

          lastFetchAtRef.current = Date.now();
          return;
        }

        if (result.featureDisabled) {
          onFeatureDisabled?.();
        }

        startTransition(() => {
          setState((prev) => ({
            ...prev,
            ...applyAttemptsResult(result, canViewDetail, bootstrap, !result.featureDisabled),
            attempts: result.featureDisabled ? [] : prev.attempts,
          }));
        });
      } catch {
        startTransition(() => {
          setState((prev) => ({
            ...prev,
            loading: false,
            listError: 'Deneme kayıtları yüklenemedi.',
          }));
        });
      } finally {
        fetchInFlightRef.current = false;
      }
    },
    [onFeatureDisabled],
  );

  useEffect(() => {
    if (skipInitialFetchRef.current) {
      skipInitialFetchRef.current = false;

      if (initialData && Object.keys(initialData.topicProgressByExam).length === 0 && initialData.denemeAdvanced) {
        const examIds = [
          ...new Set([
            ...initialData.attempts.map((a) => a.examId),
            ...(initialData.activeExamId ? [initialData.activeExamId] : []),
          ]),
        ];
        if (examIds.length > 0) {
          enrichTopicProgressInBackground(examIds, (enriched) => {
            setState((prev) => ({
              ...prev,
              topicProgressByExam: enriched.ok ? enriched.topicProgressByExam : prev.topicProgressByExam,
              primaryTopicProgress: enriched.ok ? enriched.primaryTopicProgress : prev.primaryTopicProgress,
            }));
          });
        }
      }
      return;
    }
    void loadPage();
  }, [loadPage, initialData]);

  const prependAttempt = useCallback((attempt: DenemeAttemptListItem) => {
    setState((prev) => {
      if (prev.attempts.some((item) => item.id === attempt.id)) {
        return prev;
      }
      return {
        ...prev,
        attempts: sortDenemeAttemptsByDateDesc([attempt, ...prev.attempts]),
        loading: false,
        listError: null,
      };
    });
    lastFetchAtRef.current = Date.now();
  }, []);

  return {
    ...state,
    featuresEnabled: state.denemeAdvanced !== false,
    fetchAttempts: loadPage,
    prependAttempt,
    setTopicProgressByExam: (
      updater:
        | Record<string, ExamTopicProgress>
        | ((prev: Record<string, ExamTopicProgress>) => Record<string, ExamTopicProgress>),
    ) => {
      setState((prev) => ({
        ...prev,
        topicProgressByExam: typeof updater === 'function' ? updater(prev.topicProgressByExam) : updater,
      }));
    },
  };
}
