/**
 * User settings, billing plan, password change (dashboard settings).
 */

import { fetchAvailableExams, type AvailableExam } from '@/lib/client-api/examsAvailable';

export type { AvailableExam };
export { fetchAvailableExams };

/** Raw JSON from GET /api/user/settings (shape varies by caller). */
export async function fetchUserSettingsRaw(): Promise<unknown> {
  const r = await fetch('/api/user/settings');
  return r.json();
}

export async function fetchSettingsPageBundle(): Promise<{
  settings: { ok: boolean; body: unknown };
  exams: AvailableExam[];
  plan: { ok: boolean; body: unknown };
}> {
  const [settings, exams, plan] = await Promise.all([
    fetch('/api/user/settings').then(async (r) => ({
      ok: r.ok,
      body: await r.json().catch(() => ({})),
    })),
    fetchAvailableExams(),
    fetch('/api/billing/plan').then(async (r) => ({
      ok: r.ok,
      body: await r.json().catch(() => ({})),
    })),
  ]);
  return { settings, exams, plan };
}

export async function patchUserSettings(
  body: Record<string, unknown>,
): Promise<{ ok: boolean; result: unknown }> {
  const response = await fetch('/api/user/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  const success = Boolean(
    response.ok && (result as { success?: boolean }).success,
  );
  return { ok: success, result };
}

export async function changeUserPassword(body: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ ok: boolean; result: unknown }> {
  const response = await fetch('/api/user/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  const success = Boolean(
    response.ok && (result as { success?: boolean }).success,
  );
  return { ok: success, result };
}
