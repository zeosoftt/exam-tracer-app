export type SetupWizardAssignment = { examId: string; name: string; code: string };

export type SetupWizardGetResult = {
  ok: boolean;
  completed?: boolean;
  assignments?: SetupWizardAssignment[];
  availableExams?: SetupWizardAssignment[];
  message?: string;
};

export async function fetchSetupWizardState(): Promise<SetupWizardGetResult> {
  const res = await fetch('/api/user/setup-wizard', { cache: 'no-store' });
  const json = (await res.json().catch(() => ({}))) as {
    success?: boolean;
    data?: {
      completed: boolean;
      assignments: SetupWizardAssignment[];
      availableExams: SetupWizardAssignment[];
    };
    error?: string;
  };
  if (res.ok && json.success && json.data) {
    return { ok: true, ...json.data };
  }
  return { ok: false, message: typeof json.error === 'string' ? json.error : 'Durum alınamadı.' };
}

export async function postSetupWizard(
  body:
    | { action: 'skip' }
    | {
        action: 'finish';
        examId: string;
        progressPreset: 'none' | 'starter' | 'solid';
        addSampleDeneme: boolean;
      },
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch('/api/user/setup-wizard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string | { message?: string } };
  if (res.ok && json.success === true) return { ok: true };
  const err =
    typeof json.error === 'string'
      ? json.error
      : json.error && typeof json.error === 'object' && 'message' in json.error
        ? String((json.error as { message: string }).message)
        : 'İşlem tamamlanamadı.';
  return { ok: false, error: err };
}
