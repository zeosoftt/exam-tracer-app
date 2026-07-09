/**
 * Sentry capture helpers — DSN yoksa no-op.
 */

import { isSentryEnabled } from '@/lib/sentry/options';

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (!isSentryEnabled()) return;

  void import('@sentry/nextjs').then((Sentry) => {
    if (context && Object.keys(context).length > 0) {
      Sentry.withScope((scope) => {
        scope.setExtras(context);
        Sentry.captureException(error);
      });
      return;
    }
    Sentry.captureException(error);
  });
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  if (!isSentryEnabled()) return;

  void import('@sentry/nextjs').then((Sentry) => {
    Sentry.captureMessage(message, level);
  });
}
