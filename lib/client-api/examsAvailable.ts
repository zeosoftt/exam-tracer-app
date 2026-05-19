/**
 * Client-side fetch for available exams (onboarding, settings, deneme, etc.).
 */

import { fetchJson } from '@/lib/client-api/http';

export type AvailableExam = {
  id: string;
  name: string;
  code: string;
};

export type FetchAvailableExamsResult =
  | { ok: true; exams: AvailableExam[] }
  | { ok: false; errorMessage?: string };

const LOAD_ERROR = 'Sınavlar yüklenemedi. Lütfen sayfayı yenileyin.';

export async function fetchAvailableExamsWithStatus(): Promise<FetchAvailableExamsResult> {
  const { ok, body } = await fetchJson<{
    success?: boolean;
    data?: AvailableExam[];
    message?: string;
  }>('/api/exams/available');

  if (ok && body.success && Array.isArray(body.data)) {
    return { ok: true, exams: body.data };
  }

  return { ok: false, errorMessage: body.message || LOAD_ERROR };
}

export async function fetchAvailableExams(): Promise<AvailableExam[]> {
  const r = await fetchAvailableExamsWithStatus();
  return r.ok ? r.exams : [];
}
