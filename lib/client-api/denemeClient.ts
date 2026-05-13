/**
 * Deneme (practice test) page API calls.
 */

import { fetchAvailableExams } from '@/lib/client-api/examsAvailable';
import { fetchUserSettingsRaw } from '@/lib/client-api/userSettings';

export async function fetchDenemeAttempts(limit = 50): Promise<unknown[] | null> {
  const response = await fetch(`/api/deneme?limit=${limit}`);
  if (!response.ok) return null;
  const json = await response.json();
  return json.data ?? [];
}

export async function fetchDenemeSiteFlags(): Promise<boolean> {
  const response = await fetch('/api/site/deneme-flags');
  const json = await response.json().catch(() => ({}));
  if (json.success && json.data) {
    return Boolean(json.data.deneme_show_advanced);
  }
  return false;
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
): Promise<{ ok: boolean; data: unknown }> {
  const response = await fetch('/api/deneme', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  const success = Boolean(
    response.ok && (data as { success?: boolean }).success,
  );
  return { ok: success, data };
}
