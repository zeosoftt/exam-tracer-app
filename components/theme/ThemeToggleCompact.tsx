'use client';

import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';

const modes = [
  { id: 'light', Icon: Sun, label: 'Açık tema' },
  { id: 'dark', Icon: Moon, label: 'Koyu tema' },
  { id: 'system', Icon: Monitor, label: 'Sistem temasına uy' },
] as const;

export function ThemeToggleCompact() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="flex h-9 w-[5.75rem] shrink-0 items-center rounded-lg border border-stone-200 bg-stone-100/80 p-0.5 dark:border-stone-700 dark:bg-stone-900/80"
        aria-hidden
      />
    );
  }

  return (
    <div
      className="flex h-9 w-[5.75rem] shrink-0 items-center rounded-lg border border-stone-200 bg-stone-100/80 p-0.5 dark:border-stone-700 dark:bg-stone-900/80"
      role="group"
      aria-label="Görünüm teması"
    >
      {modes.map(({ id, Icon, label }) => (
        <button
          key={id}
          type="button"
          title={label}
          aria-label={label}
          aria-pressed={theme === id}
          onClick={() => setTheme(id)}
          className={cn(
            'rounded-md p-2 text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100',
            theme === id &&
              'bg-white text-primary-700 shadow-sm dark:bg-stone-800 dark:text-primary-400',
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </button>
      ))}
    </div>
  );
}
