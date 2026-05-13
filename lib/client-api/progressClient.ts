/**
 * Topic progress PATCH (dashboard detail, evaluation editor).
 */

export async function patchTopicProgress(
  topicId: string,
  body: Record<string, unknown>,
): Promise<{ ok: boolean; error?: unknown }> {
  const response = await fetch(`/api/progress/${topicId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (response.ok) return { ok: true };
  return { ok: false, error: result };
}
