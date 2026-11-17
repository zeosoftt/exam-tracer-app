'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { postSessionDuration } from '@/lib/client-api/sessionAnalyticsClient';

const STORAGE_KEY = 'app_session_id';
/** Sekme görünürken periyodik kayıt; asıl kayıt gizlenme/kapanışta beacon ile yapılır. */
const HEARTBEAT_MS = 120_000;
const MIN_FLUSH_SECONDS = 5;

function getOrCreateClientSessionId(): string {
  try {
    const existing = sessionStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

/**
 * Sekme açıkken görünür süreyi ölçer; dashboard dahil tüm rotalarda çalışır.
 */
export function SessionDurationTracker() {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const clientSessionIdRef = useRef<string | null>(null);
  const startedAtRef = useRef<string | null>(null);
  const visibleSinceRef = useRef<number | null>(null);
  const accumulatedSecondsRef = useRef(0);

  pathnameRef.current = pathname;

  useEffect(() => {
    clientSessionIdRef.current = getOrCreateClientSessionId();
    startedAtRef.current = new Date().toISOString();

    const getTotalSeconds = () => {
      let total = accumulatedSecondsRef.current;
      if (visibleSinceRef.current !== null) {
        total += Math.floor((Date.now() - visibleSinceRef.current) / 1000);
      }
      return total;
    };

    const markVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (visibleSinceRef.current === null) {
        visibleSinceRef.current = Date.now();
      }
    };

    const markHidden = () => {
      if (visibleSinceRef.current !== null) {
        accumulatedSecondsRef.current += Math.floor(
          (Date.now() - visibleSinceRef.current) / 1000,
        );
        visibleSinceRef.current = null;
      }
    };

    const lastFlushedSecondsRef = { current: 0 };

    const flush = (force = false, beacon = false) => {
      const clientSessionId = clientSessionIdRef.current;
      const startedAt = startedAtRef.current;
      if (!clientSessionId || !startedAt) return;

      const durationSeconds = getTotalSeconds();
      if (durationSeconds < MIN_FLUSH_SECONDS) return;
      // Değişmeyen süreyi tekrar gönderme (gereksiz fonksiyon çağrısı + DB yazımı)
      if (!force && durationSeconds === lastFlushedSecondsRef.current) return;
      lastFlushedSecondsRef.current = durationSeconds;

      void postSessionDuration(
        {
          clientSessionId,
          durationSeconds,
          startedAt,
          lastPath: pathnameRef.current ?? undefined,
        },
        { beacon },
      );
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        markHidden();
        flush(true, true);
      } else {
        markVisible();
      }
    };

    markVisible();

    const heartbeat = window.setInterval(() => {
      if (document.visibilityState === 'visible') flush(false);
    }, HEARTBEAT_MS);

    const onPageHide = () => {
      markHidden();
      flush(true, true);
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      window.clearInterval(heartbeat);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', onPageHide);
      markHidden();
      flush(true, true);
    };
  }, []);

  return null;
}
