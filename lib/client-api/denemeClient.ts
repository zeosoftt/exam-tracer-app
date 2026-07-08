/**
 * Deneme (practice test) page API calls.
 */

import { fetchAvailableExams } from '@/lib/client-api/examsAvailable';
import { fetchJson, getApiErrorMessage, mutateApi } from '@/lib/client-api/http';
import { fetchJsonCached, invalidateRequestCache } from '@/lib/client-api/requestCache';
import { fetchUserSettingsRaw } from '@/lib/client-api/userSettings';

export type ExamTopicProgress = {
  completed: number;
  total: number;
  pct: number;
};

export type PrimaryTopicProgress = ExamTopicProgress & {
  examId: string;
  examName: string | null;
};

export type DenemeAttemptListItem = {
  id: string;
  examId: string;
  exam: { id: string; name: string; code: string };
  attemptedAt: string;
  completedAt: string | null;
  totalScore: number | null;
  netScore: number | null;
  rightCount: number | null;
  wrongCount: number | null;
  emptyCount: number | null;
  durationMinutes: number | null;
  status: string;
  notes: string | null;
};

export type DenemeBreakdownItem = {
  subjectId: string;
  subjectName: string;
  right: number;
  wrong: number;
  empty: number;
  net: number;
};

export type DenemeAttemptDetail = DenemeAttemptListItem & {
  breakdown: DenemeBreakdownItem[] | null;
  topicBreakdown?: unknown;
};

export type DenemeTopicAnalysis = import('@/lib/deneme/analysis/types').DenemeTopicAnalysisResult;

export function getDenemeDetailPath(attemptId: string): string {
  return `/dashboard/deneme/${attemptId}`;
}

export type DenemeFetchResult =
  | {
      ok: true;
      data: DenemeAttemptListItem[];
      topicProgressByExam: Record<string, ExamTopicProgress>;
      primaryTopicProgress: PrimaryTopicProgress | null;
    }
  | { ok: false; error: string; premiumRequired?: boolean; featureDisabled?: boolean };

type DenemeListEnvelope = {
  success?: boolean;
  data?: DenemeAttemptListItem[];
  topicProgressByExam?: Record<string, ExamTopicProgress>;
  primaryTopicProgress?: PrimaryTopicProgress | null;
  error?: string | { message?: string };
  code?: string;
};

function denemeErrorMessage(body: DenemeListEnvelope, fallback: string): string {
  if (typeof body.error === 'string') return body.error;
  if (typeof body.error === 'object' && body.error?.message) return body.error.message;
  return fallback;
}

export async function fetchDenemeAttempts(
  limit = 50,
  progressExamIds?: string[],
): Promise<DenemeFetchResult> {
  try {
    const params = new URLSearchParams({ limit: String(limit) });
    if (progressExamIds?.length) {
      params.set('progressExamIds', progressExamIds.join(','));
    }
    const { ok, body } = await fetchJsonCached<DenemeListEnvelope>(`/api/deneme?${params.toString()}`);

    if (!ok || !body.success) {
      if (body.code === 'PREMIUM_REQUIRED') {
        return {
          ok: false,
          error: denemeErrorMessage(body, 'Deneme takibi Premium plan özelliğidir.'),
          premiumRequired: true,
        };
      }
      if (body.code === 'FEATURE_DISABLED') {
        return {
          ok: false,
          error: denemeErrorMessage(body, 'Gelişmiş deneme özellikleri kapalı.'),
          featureDisabled: true,
        };
      }
      return {
        ok: false,
        error: denemeErrorMessage(body, 'Deneme kayıtları yüklenemedi.'),
      };
    }
    return {
      ok: true,
      data: body.data ?? [],
      topicProgressByExam: body.topicProgressByExam ?? {},
      primaryTopicProgress: body.primaryTopicProgress ?? null,
    };
  } catch {
    return { ok: false, error: 'Bağlantı hatası. Lütfen tekrar deneyin.' };
  }
}

export async function fetchDenemeSiteFlags(): Promise<boolean> {
  const { ok, body } = await fetchJsonCached<{ success?: boolean; data?: { deneme_show_advanced?: boolean } }>(
    '/api/site/deneme-flags',
  );
  if (!ok || !body.success) return false;
  return Boolean(body.data?.deneme_show_advanced);
}

/** Premium (ADVANCED_ANALYTICS) — deneme detay sayfası ve konu analizi */
export async function fetchDenemeDetailAccess(): Promise<boolean> {
  const { ok, body } = await fetchJsonCached<{ success?: boolean; data?: { features?: string[] } }>(
    '/api/billing/plan',
  );
  if (!ok || !body.success) return false;
  return body.data?.features?.includes('ADVANCED_ANALYTICS') ?? false;
}

export async function loadDenemeFormBootstrap(): Promise<{
  exams: Awaited<ReturnType<typeof fetchAvailableExams>>;
  activeExamId: string | null;
}> {
  const [exams, settings] = await Promise.all([fetchAvailableExams(), fetchUserSettingsRaw()]);
  const s = settings as {
    success?: boolean;
    data?: { activeExam?: { id: string } | null };
  };
  const activeExamId = s.success && s.data?.activeExam?.id ? s.data.activeExam.id : null;
  return { exams, activeExamId };
}

export async function fetchExamStructure(examId: string): Promise<unknown> {
  const { body } = await fetchJson(`/api/exams/${examId}/structure`);
  return body;
}

export async function fetchKpssDenemeStats(): Promise<unknown> {
  const { body } = await fetchJson('/api/deneme/kpss-stats');
  return body;
}

export async function postDenemeAttempt(
  body: Record<string, unknown>,
): Promise<{ ok: boolean; data: unknown; premiumRequired?: boolean }> {
  const { ok, status, result } = await mutateApi<Record<string, unknown>, unknown>('/api/deneme', 'POST', body);
  const code = (result as { code?: string }).code;
  if (status === 403 && code === 'PREMIUM_REQUIRED') {
    return { ok: false, data: result, premiumRequired: true };
  }
  if (ok) {
    invalidateRequestCache('/api/deneme');
  }
  return { ok, data: result };
}

export async function deleteDenemeAttempt(
  attemptId: string,
): Promise<{ ok: true } | { ok: false; error: string; featureDisabled?: boolean }> {
  try {
    const { ok, status, result } = await mutateApi<undefined, { id: string }>(
      `/api/deneme/${attemptId}`,
      'DELETE',
    );

    if (status === 403 && result.code === 'FEATURE_DISABLED') {
      return { ok: false, error: getApiErrorMessage(result, 'Deneme takibi kapalı.'), featureDisabled: true };
    }

    if (!ok || !result.success) {
      return { ok: false, error: getApiErrorMessage(result, 'Deneme kaydı silinemedi.') };
    }

    invalidateRequestCache('/api/deneme');
    return { ok: true };
  } catch {
    return { ok: false, error: 'Bağlantı hatası. Lütfen tekrar deneyin.' };
  }
}

export type InstitutionResultImport = {
  sourceUrl: string;
  sourceHost: string;
  platform: 'verisayar' | 'unknown';
  examName: string;
  examDate: string | null;
  examNumber: string | null;
  institution: string | null;
  studentName: string | null;
  subjects: Array<{
    name: string;
    questionCount: number;
    right: number;
    wrong: number;
    empty: number;
    net: number;
  }>;
  sectionTotals: {
    generalAbility: { right: number; wrong: number; net: number; questionCount: number } | null;
    generalCulture: { right: number; wrong: number; net: number; questionCount: number } | null;
  };
  scores: Array<{ type: string; score: number; rankKurum: number | null; rankNational: number | null }>;
  topics: Array<{
    subjectName: string;
    topicName: string;
    questionCount: number;
    right: number;
    wrong: number;
    empty: number;
    successRate: number;
  }>;
  totals: { right: number; wrong: number; empty: number; net: number; questionCount: number };
};

/** @deprecated InstitutionResultImport kullanın */
export type PegemImportResult = InstitutionResultImport;

export async function fetchInstitutionResultImport(
  url: string,
): Promise<{ ok: true; data: InstitutionResultImport } | { ok: false; error: string; premiumRequired?: boolean }> {
  try {
    const { ok, status, result } = await mutateApi<{ url: string }, InstitutionResultImport>(
      '/api/deneme/import/result',
      'POST',
      { url },
    );

    if (status === 403 && result.code === 'PREMIUM_REQUIRED') {
      return {
        ok: false,
        error: getApiErrorMessage(result, 'Premium gerekli.'),
        premiumRequired: true,
      };
    }

    if (!ok || !result.success || !result.data) {
      return { ok: false, error: getApiErrorMessage(result, 'Kurum sonucu alınamadı.') };
    }

    return { ok: true, data: result.data };
  } catch {
    return { ok: false, error: 'Bağlantı hatası. Lütfen tekrar deneyin.' };
  }
}

/** @deprecated fetchInstitutionResultImport kullanın */
export const fetchPegemImport = fetchInstitutionResultImport;

export async function fetchDenemeAttemptDetail(
  attemptId: string,
): Promise<
  | { ok: true; data: DenemeAttemptDetail }
  | { ok: false; error: string; premiumRequired?: boolean; notFound?: boolean }
> {
  try {
    const { ok, status, body } = await fetchJson<{
      success?: boolean;
      data?: DenemeAttemptDetail;
      error?: string | { message?: string };
      code?: string;
    }>(`/api/deneme/${attemptId}`);

    if (status === 403 && body.code === 'PREMIUM_REQUIRED') {
      return {
        ok: false,
        error: typeof body.error === 'string' ? body.error : 'Premium gerekli.',
        premiumRequired: true,
      };
    }

    if (status === 404) {
      return { ok: false, error: 'Deneme kaydı bulunamadı.', notFound: true };
    }

    if (!ok || !body.success || !body.data) {
      const message =
        typeof body.error === 'string'
          ? body.error
          : typeof body.error === 'object' && body.error?.message
            ? body.error.message
            : 'Deneme detayı yüklenemedi.';
      return { ok: false, error: message };
    }

    return { ok: true, data: body.data };
  } catch {
    return { ok: false, error: 'Bağlantı hatası. Lütfen tekrar deneyin.' };
  }
}

export async function saveInstitutionResultAsAttempt(
  url: string,
  examId: string,
  importData?: InstitutionResultImport,
): Promise<
  | { ok: true; data: DenemeAttemptListItem }
  | { ok: false; error: string; premiumRequired?: boolean }
> {
  try {
    const { ok, status, result } = await mutateApi<
      { url: string; examId: string; importData?: InstitutionResultImport },
      DenemeAttemptListItem
    >('/api/deneme/import/result/save', 'POST', { url, examId, importData });

    if (status === 403 && result.code === 'PREMIUM_REQUIRED') {
      return {
        ok: false,
        error: getApiErrorMessage(result, 'Premium gerekli.'),
        premiumRequired: true,
      };
    }

    if (!ok || !result.success || !result.data) {
      return { ok: false, error: getApiErrorMessage(result, 'Deneme kaydı oluşturulamadı.') };
    }

    invalidateRequestCache('/api/deneme');
    return { ok: true, data: result.data };
  } catch {
    return { ok: false, error: 'Bağlantı hatası. Lütfen tekrar deneyin.' };
  }
}

export async function fetchDenemeAttemptAnalysis(
  attemptId: string,
): Promise<
  | { ok: true; data: DenemeTopicAnalysis }
  | { ok: false; error: string; premiumRequired?: boolean; notFound?: boolean }
> {
  try {
    const { ok, status, body } = await fetchJson<{
      success?: boolean;
      data?: DenemeTopicAnalysis;
      error?: string | { message?: string };
      code?: string;
    }>(`/api/deneme/${attemptId}/analysis`);

    if (status === 403 && body.code === 'PREMIUM_REQUIRED') {
      return {
        ok: false,
        error: typeof body.error === 'string' ? body.error : 'Premium gerekli.',
        premiumRequired: true,
      };
    }

    if (status === 404) {
      return { ok: false, error: 'Analiz verisi bulunamadı.', notFound: true };
    }

    if (!ok || !body.success || !body.data) {
      const message =
        typeof body.error === 'string'
          ? body.error
          : typeof body.error === 'object' && body.error?.message
            ? body.error.message
            : 'Analiz yüklenemedi.';
      return { ok: false, error: message };
    }

    return { ok: true, data: body.data };
  } catch {
    return { ok: false, error: 'Bağlantı hatası. Lütfen tekrar deneyin.' };
  }
}
