import * as Sentry from '@sentry/nextjs';
import { getSentryInitOptions } from '@/lib/sentry/options';

function parseSampleRate(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = parseFloat(value);
  return Number.isFinite(n) && n >= 0 && n <= 1 ? n : fallback;
}

const replayOnError = parseSampleRate(process.env.SENTRY_REPLAY_ON_ERROR_SAMPLE_RATE, 0);

Sentry.init({
  ...getSentryInitOptions(),
  ...(replayOnError > 0
    ? {
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: replayOnError,
      }
    : {}),
});

/**
 * Replay entegrasyonu statik import edilmez: aksi halde ~40 kB (gzip) Replay kodu
 * her sayfanın paylaşılan bundle'ına girer. Yalnızca örnekleme açıkken CDN'den yüklenir.
 */
if (replayOnError > 0 && typeof window !== 'undefined') {
  void Sentry.lazyLoadIntegration('replayIntegration')
    .then((replayIntegration) => {
      Sentry.addIntegration(
        replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      );
    })
    .catch(() => {
      // Replay opsiyonel; yüklenemezse sessiz geç
    });
}
