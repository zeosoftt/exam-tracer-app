'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/** Küçük ekranda ana sayfa dönüşümü için sabit CTA (pb ile içerik üstüne binmez). */
export function MobileLandingCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.12)] backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/95 sm:hidden">
      <div className="mx-auto flex max-w-lg items-center gap-2">
        <Link
          href="/onboarding"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 py-3 text-sm font-bold text-white shadow-lg shadow-primary-600/25"
        >
          Ücretsiz başla
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/auth/login"
          className="rounded-xl border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-700 dark:border-stone-600 dark:text-stone-200"
        >
          Giriş
        </Link>
      </div>
    </div>
  );
}
