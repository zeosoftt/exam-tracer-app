'use client';

import { ThemeToggleCompact } from '@/components/theme/ThemeToggleCompact';

export function AuthThemeToggle() {
  return (
    <div className="fixed right-4 top-4 z-50 sm:right-6 sm:top-5">
      <ThemeToggleCompact />
    </div>
  );
}
