'use client';

import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';

const options = [
  { value: 'light', label: 'Açık', Icon: Sun, description: 'Aydınlık arka plan, uzun metin okuması için' },
  { value: 'dark', label: 'Koyu', Icon: Moon, description: 'Düşük parlaklık, akşam çalışması için' },
  { value: 'system', label: 'Sistem', Icon: Monitor, description: 'İşletim sistemi veya tarayıcı tercihinizi kullanır' },
] as const;

export function ThemeSelect({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn('h-24 animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800', className)}
        aria-hidden
      />
    );
  }

  return (
    <div className={cn('grid gap-3 sm:grid-cols-3', className)} role="radiogroup" aria-label="Tema seçimi">
      {options.map(({ value, label, Icon, description }) => {
        const selected = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setTheme(value)}
            className={cn(
              'flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-colors',
              selected
                ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/20 dark:border-primary-500 dark:bg-primary-950/40 dark:ring-primary-400/30'
                : 'border-stone-200 bg-white hover:border-stone-300 dark:border-stone-700 dark:bg-stone-900/50 dark:hover:border-stone-600',
            )}
          >
            <span className="flex w-full items-center gap-2">
              <Icon
                className={cn(
                  'h-5 w-5',
                  selected ? 'text-primary-700 dark:text-primary-400' : 'text-stone-500 dark:text-stone-400',
                )}
                aria-hidden
              />
              <span
                className={cn(
                  'font-semibold',
                  selected
                    ? 'text-stone-900 dark:text-stone-100'
                    : 'text-stone-800 dark:text-stone-200',
                )}
              >
                {label}
              </span>
            </span>
            <span className="text-xs leading-snug text-stone-500 dark:text-stone-400">{description}</span>
          </button>
        );
      })}
    </div>
  );
}
