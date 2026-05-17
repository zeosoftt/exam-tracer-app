/**
 * Deneme (practice test) page API calls.
 */

import { fetchAvailableExams } from '@/lib/client-api/examsAvailable';
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

export async function fetchDenemeAttempts(
  limit = 50,
  progressExamIds?: string[],
): Promise<DenemeFetchResult> {
  try {
    const params = new URLSearchParams({ limit: String(limit) });
    if (progressExamIds?.length) {
      params.set('progressExamIds', progressExamIds.join(','));
    }
    const response = await fetch(`/api/deneme?${params.toString()}`);
    const json = (await response.json().catch(() => ({}))) as {
      success?: boolean;
      data?: DenemeAttemptListItem[];
      topicProgressByExam?: Record<string, ExamTopicProgress>;
      primaryTopicProgress?: PrimaryTopicProgress | null;
      error?: string;
      code?: string;
    };
    if (!response.ok || !json.success) {
      if (json.code === 'PREMIUM_REQUIRED') {
        return {
          ok: false,
          error: typeof json.error === 'string' ? json.error : 'Deneme takibi Premium plan özelliğidir.',
          premiumRequired: true,
        };
      }
      if (json.code === 'FEATURE_DISABLED') {
        return {
          ok: false,
          error: typeof json.error === 'string' ? json.error : 'Gelişmiş deneme özellikleri kapalı.',
          featureDisabled: true,
        };
      }
      return {
        ok: false,
        error: typeof json.error === 'string' ? json.error : 'Deneme kayıtları yüklenemedi.',
      };
    }
    return {
      ok: true,
      data: json.data ?? [],
      topicProgressByExam: json.topicProgressByExam ?? {},
      primaryTopicProgress: json.primaryTopicProgress ?? null,
    };
  } catch {
    return { ok: false, error: 'Bağlantı hatası. Lütfen tekrar deneyin.' };
  }
}

export async function fetchDenemeSiteFlags(): Promise<boolean> {
  try {
    const response = await fetch('/api/site/deneme-flags');
    const json = (await response.json().catch(() => ({}))) as {
      success?: boolean;
      data?: { deneme_show_advanced?: boolean };
    };
    if (json.success && json.data) {
      return Boolean(json.data.deneme_show_advanced);
    }
    return false;
  } catch {
    return false;
  }
}

export async function loadDenemeFormBootstrap(): Promise<{
  exams: Awaited<ReturnType<typeof fetchAvailableExams>>;
  activeExamId: string | null;
}> {
  const [exams, settings] = await Promise.all([
    fetchAvailableExams(),
    fetchUserSettingsRaw(),
  ]);
  const s = settings as {
    success?: boolean;
    data?: { activeExam?: { id: string } | null };
  };
  const activeExamId =
    s.success && s.data?.activeExam?.id ? s.data.activeExam.id : null;
  return { exams, activeExamId };
}

export async function fetchExamStructure(examId: string): Promise<unknown> {
  const response = await fetch(`/api/exams/${examId}/structure`);
  return response.json();
}

export async function fetchKpssDenemeStats(): Promise<unknown> {
  const response = await fetch('/api/deneme/kpss-stats');
  return response.json();
}

export async function postDenemeAttempt(
  body: Record<string, unknown>,
): Promise<{ ok: boolean; data: unknown; premiumRequired?: boolean }> {
  const response = await fetch('/api/deneme', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  const payload = data as { success?: boolean; code?: string };
  if (response.status === 403 && payload.code === 'PREMIUM_REQUIRED') {
    return { ok: false, data, premiumRequired: true };
  }
  const success = Boolean(response.ok && payload.success);
  return { ok: success, data };
}
