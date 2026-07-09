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

type ThemeToggleCompactProps = {
  className?: string;
};

export function ThemeToggleCompact({ className }: ThemeToggleCompactProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const shellClass = cn(
    'flex h-8 min-w-[5rem] max-w-full shrink-0 items-center rounded-lg border border-stone-200 bg-stone-100/80 p-0.5 dark:border-stone-700 dark:bg-stone-900/80 sm:h-9 sm:min-w-[5.75rem]',
    className,
  );

  if (!mounted) {
    return <div className={shellClass} aria-hidden />;
  }

  return (
    <div className={shellClass} role="group" aria-label="Görünüm teması">
      {modes.map(({ id, Icon, label }) => (
        <button
          key={id}
          type="button"
          title={label}
          aria-label={label}
          aria-pressed={theme === id}
          onClick={() => setTheme(id)}
          className={cn(
            'flex flex-1 items-center justify-center rounded-md p-1.5 text-stone-500 transition-colors touch-manipulation hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 sm:p-2',
            theme === id &&
              'bg-white text-primary-700 shadow-sm dark:bg-stone-800 dark:text-primary-400',
          )}
        >
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
        </button>
      ))}
    </div>
  );
}
