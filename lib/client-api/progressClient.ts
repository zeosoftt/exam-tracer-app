/**
 * Topic progress PATCH (dashboard detail, evaluation editor).
 */

import { mutateApi } from '@/lib/client-api/http';

export async function patchTopicProgress(
  topicId: string,
  body: Record<string, unknown>,
): Promise<{ ok: boolean; error?: unknown }> {
  const { ok, result } = await mutateApi<Record<string, unknown>, unknown>(
    `/api/progress/${topicId}`,
    'PATCH',
    body,
  );
  if (ok) return { ok: true };
  return { ok: false, error: result };
}
