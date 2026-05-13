/**
 * Client-side fetch for available exams (onboarding, settings, deneme, etc.).
 */

export type AvailableExam = {
  id: string;
  name: string;
  code: string;
};

export type FetchAvailableExamsResult =
  | { ok: true; exams: AvailableExam[] }
  | { ok: false; errorMessage?: string };

export async function fetchAvailableExamsWithStatus(): Promise<FetchAvailableExamsResult> {
  const response = await fetch('/api/exams/available');
  if (response.ok) {
    const result = await response.json().catch(() => ({}));
    if (result.success && Array.isArray(result.data)) {
      return { ok: true, exams: result.data };
    }
    return { ok: false, errorMessage: 'Sınavlar yüklenemedi. Lütfen sayfayı yenileyin.' };
  }
  const errorData = await response.json().catch(() => ({}));
  return {
    ok: false,
    errorMessage:
      (errorData as { message?: string }).message ||
      'Sınavlar yüklenemedi. Lütfen sayfayı yenileyin.',
  };
}

export async function fetchAvailableExams(): Promise<AvailableExam[]> {
  const r = await fetchAvailableExamsWithStatus();
  return r.ok ? r.exams : [];
}
