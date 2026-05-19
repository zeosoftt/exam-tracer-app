/**
 * User settings, billing plan, password change (dashboard settings).
 */

import { fetchAvailableExams, type AvailableExam } from '@/lib/client-api/examsAvailable';
import { fetchJson, mutateApi } from '@/lib/client-api/http';

export type { AvailableExam };
export { fetchAvailableExams };

export async function fetchUserSettingsRaw(): Promise<unknown> {
  const { body } = await fetchJson('/api/user/settings');
  return body;
}

export async function fetchSettingsPageBundle(): Promise<{
  settings: { ok: boolean; body: unknown };
  exams: AvailableExam[];
  plan: { ok: boolean; body: unknown };
}> {
  const [settings, exams, plan] = await Promise.all([
    fetchJson('/api/user/settings'),
    fetchAvailableExams(),
    fetchJson('/api/billing/plan'),
  ]);
  return {
    settings: { ok: settings.ok, body: settings.body },
    exams,
    plan: { ok: plan.ok, body: plan.body },
  };
}

export async function patchUserSettings(
  body: Record<string, unknown>,
): Promise<{ ok: boolean; result: unknown }> {
  const { ok, result } = await mutateApi<Record<string, unknown>, unknown>(
    '/api/user/settings',
    'PATCH',
    body,
  );
  return { ok, result };
}

export async function changeUserPassword(body: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ ok: boolean; result: unknown }> {
  const { ok, result } = await mutateApi('/api/user/change-password', 'POST', body);
  return { ok, result };
}
