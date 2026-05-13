'use client';

import dynamic from 'next/dynamic';

/** 404 vb. hafif rotalar: tema değiştiriciyi ayrı chunk’a böler, ana sayfada prefetch edilen not-found JS’ini inceltir. */
export const PublicThemeCornerLazy = dynamic(
  () => import('./PublicThemeCorner').then((mod) => ({ default: mod.PublicThemeCorner })),
  {
    ssr: false,
    loading: () => (
      <div className="fixed right-4 top-4 z-[100] sm:right-6 sm:top-5" aria-hidden>
        <div className="h-9 w-[5.75rem] shrink-0 rounded-lg border border-stone-200 bg-stone-100/80 dark:border-stone-700 dark:bg-stone-900/80" />
      </div>
    ),
  },
);
