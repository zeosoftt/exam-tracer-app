'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';

const DISMISS_KEY = 'landing-sticky-cta-dismissed';

/** Masaüstünde hero sonrası görünen yapışkan dönüşüm bandı (mobilde MobileLandingCta yeterli). */
export function LandingStickyCta() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === '1') {
        setDismissed(true);
        return;
      }
      setDismissed(false);
    } catch {
      setDismissed(false);
    }
  }, []);

  useEffect(() => {
    if (dismissed) return;

    const onScroll = () => {
      setVisible(window.scrollY > 520);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [dismissed]);

  const dismiss = () => {
    setDismissed(true);
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // ignore
    }
  };

  if (dismissed || !visible) return null;

  return (
    <div
      className="landing-hero-in fixed bottom-6 left-1/2 z-40 hidden w-[min(100%,28rem)] -translate-x-1/2 md:block"
      role="region"
      aria-label="Hızlı kayıt"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-stone-200/80 bg-white/95 py-2.5 pl-4 pr-2 shadow-xl shadow-stone-900/10 backdrop-blur-md dark:border-stone-700 dark:bg-stone-900/95">
        <p className="min-w-0 flex-1 text-sm font-medium text-stone-800 dark:text-stone-100">
          <span className="text-primary-700 dark:text-primary-300">2 dakikada</span> ilk sınavınızı ekleyin
        </p>
        <Link
          href="/onboarding"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 px-4 py-2 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Başla
          <ArrowRight className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800 dark:hover:text-stone-200"
          aria-label="Kapat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
