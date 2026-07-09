import * as Sentry from '@sentry/nextjs';
import { getSentryInitOptions } from '@/lib/sentry/options';

Sentry.init({
  ...getSentryInitOptions(),
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
});
