/**
 * Client-side session duration — POST /api/analytics/session
 */

export type SessionDurationPayload = {
  clientSessionId: string;
  durationSeconds: number;
  startedAt: string;
  lastPath?: string;
};

const ENDPOINT = '/api/analytics/session';

/**
 * Sayfa kapanırken/gizlenirken `sendBeacon` kullanılır: fetch'in iptal edilme riski yoktur,
 * ana iş parçacığını bloklamaz. Diğer durumlarda keepalive fetch.
 */
export async function postSessionDuration(
  payload: SessionDurationPayload,
  options?: { beacon?: boolean },
): Promise<void> {
  const body = JSON.stringify(payload);

  if (options?.beacon && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    try {
      const sent = navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
      if (sent) return;
    } catch {
      // beacon desteklenmiyorsa fetch'e düş
    }
  }

  try {
    await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    });
  } catch {
    // non-blocking
  }
}
