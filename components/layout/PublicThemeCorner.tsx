'use client';

import { ThemeToggleCompact } from '@/components/theme/ThemeToggleCompact';

/** Sunucu bileşenli sayfalarda sabit köşe tema değiştirici */
export function PublicThemeCorner() {
  return (
    <div className="fixed right-4 top-4 z-[100] sm:right-6 sm:top-5">
      <ThemeToggleCompact />
    </div>
  );
}
