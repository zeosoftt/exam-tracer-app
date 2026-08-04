/**
 * Sentry init options — DSN yoksa devre dışı (local/CI kırılmaz).
 */

import type { Options } from '@sentry/core';
import { AUTH_ERROR_CODES } from '@/config/constants';

function parseSampleRate(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = parseFloat(value);
  return Number.isFinite(n) && n >= 0 && n <= 1 ? n : fallback;
}

export function isSentryEnabled(): boolean {
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev && process.env.SENTRY_ENABLE_DEV !== 'true') {
    return false;
  }

  if (typeof window !== 'undefined') {
    return Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN?.trim());
  }
  return Boolean(process.env.SENTRY_DSN?.trim() || process.env.NEXT_PUBLIC_SENTRY_DSN?.trim());
}

export function getSentryDsn(): string | undefined {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() || undefined;
  }
  return process.env.SENTRY_DSN?.trim() || process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() || undefined;
}

function getRelease(): string | undefined {
  return (
    process.env.SENTRY_RELEASE?.trim() ||
    process.env.VERCEL_GIT_COMMIT_SHA?.trim() ||
    process.env.NEXT_PUBLIC_APP_VERSION?.trim() ||
    undefined
  );
}

const IGNORED_ERRORS = [
  'ResizeObserver loop limit exceeded',
  'ResizeObserver loop completed with undelivered notifications',
  'Non-Error promise rejection captured',
  'Loading chunk',
  'ChunkLoadError',
  'Invalid email or password',
  'Email and password are required',
  'Account is inactive',
  'CredentialsSignin',
  // Next.js dev HMR / stale .next cache (webpack-runtime module load)
  "Cannot read properties of undefined (reading 'call')",
  'Cannot find module',
];

export function getSentryInitOptions(): Options {
  return {
    dsn: getSentryDsn(),
    enabled: isSentryEnabled(),
    environment:
      process.env.SENTRY_ENVIRONMENT?.trim() ||
      process.env.VERCEL_ENV ||
      process.env.NODE_ENV ||
      'development',
    release: getRelease(),
    tracesSampleRate: parseSampleRate(process.env.SENTRY_TRACES_SAMPLE_RATE, 0.1),
    sendDefaultPii: false,
    ignoreErrors: IGNORED_ERRORS,
    beforeSend(event) {
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
      const message = event.exception?.values?.[0]?.value ?? event.message ?? '';
      if (typeof message === 'string') {
        if (
          message.includes('Invalid email or password') ||
          message.includes('CredentialsSignin') ||
          message === AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED
        ) {
          return null;
        }
        if (
          message.includes("reading 'call'") ||
          (message.includes('Cannot find module') && message.includes('.next'))
        ) {
          return null;
        }
        const url = event.request?.url ?? '';
        if (url.includes('localhost') || url.includes('127.0.0.1')) {
          return null;
        }
      }
      return event;
    },
  };
}
