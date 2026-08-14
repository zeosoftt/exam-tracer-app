/**
 * Client-side session duration — POST /api/analytics/session
 */

export type SessionDurationPayload = {
  clientSessionId: string;
  durationSeconds: number;
  startedAt: string;
  lastPath?: string;
};

export async function postSessionDuration(payload: SessionDurationPayload): Promise<void> {
  try {
    await fetch('/api/analytics/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // non-blocking
  }
}
