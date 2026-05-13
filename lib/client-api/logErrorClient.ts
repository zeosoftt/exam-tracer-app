/**
 * Client error reporting to /api/log-error.
 */

export async function postClientError(payload: {
  message: string;
  stack?: string;
  componentStack?: string;
  url?: string;
  userAgent?: string;
}): Promise<void> {
  try {
    await fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // best-effort
  }
}
