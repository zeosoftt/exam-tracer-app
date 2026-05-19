/**
 * Deneme (practice test) page API calls.
 */

import { fetchAvailableExams } from '@/lib/client-api/examsAvailable';
import { fetchApiData, fetchJson, mutateApi } from '@/lib/client-api/http';
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
    const { ok, body } = await fetchJson<DenemeListEnvelope>(`/api/deneme?${params.toString()}`);

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
  const result = await fetchApiData<{ deneme_show_advanced?: boolean }>('/api/site/deneme-flags');
  return result.ok ? Boolean(result.data.deneme_show_advanced) : false;
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
  return { ok, data: result };
}
