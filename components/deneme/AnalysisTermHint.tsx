'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ANALYSIS_TERMS, type AnalysisTermKey } from '@/lib/deneme/analysis/termDefinitions';

type AnalysisTermHintProps = {
  term: AnalysisTermKey;
  /** Görünen kısa etiket; verilmezse sözlükten alınır */
  label?: string;
  className?: string;
  labelClassName?: string;
  showIcon?: boolean;
};

export function AnalysisTermHint({
  term,
  label,
  className,
  labelClassName,
  showIcon = true,
}: AnalysisTermHintProps) {
  const def = ANALYSIS_TERMS[term];
  const displayLabel = label ?? def.shortLabel;
  const tooltipId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const close = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <span
      ref={rootRef}
      className={cn('group/term relative inline-flex max-w-full items-center gap-1', className)}
    >
      <button
        type="button"
        className="inline-flex max-w-full cursor-help items-center gap-1 rounded-sm text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60"
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={cn('underline decoration-dotted underline-offset-2', labelClassName)}>{displayLabel}</span>
        {showIcon ? (
          <HelpCircle
            className="h-3.5 w-3.5 shrink-0 text-stone-400 group-hover/term:text-primary-600 dark:text-stone-500 dark:group-hover/term:text-primary-400"
            aria-hidden
          />
        ) : null}
      </button>

      <span
        id={tooltipId}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-0 top-[calc(100%+8px)] z-30 w-[min(18rem,calc(100vw-2rem))] rounded-xl border border-stone-200 bg-white p-3 text-left shadow-lg dark:border-stone-700 dark:bg-stone-900 sm:left-1/2 sm:-translate-x-1/2',
          open ? 'block' : 'hidden',
        )}
      >
        <span
          className="absolute -top-1.5 left-4 h-3 w-3 rotate-45 border-l border-t border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900 sm:left-1/2 sm:-translate-x-1/2"
          aria-hidden
        />
        <p className="text-xs font-bold text-stone-900 dark:text-stone-100">{def.title}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-stone-600 dark:text-stone-300">{def.description}</p>
        {def.formula ? (
          <p className="mt-2 rounded-lg bg-stone-50 px-2 py-1.5 text-[11px] leading-relaxed text-stone-700 dark:bg-stone-800 dark:text-stone-300">
            {def.formula}
          </p>
        ) : null}
        {def.example ? (
          <p className="mt-1.5 text-[11px] text-stone-500 dark:text-stone-400">Örnek: {def.example}</p>
        ) : null}
      </span>
    </span>
  );
}

export function AnalysisGlossary() {
  const entries: AnalysisTermKey[] = [
    'knowledge',
    'performance',
    'gap',
    'application',
    'impact',
    'fakeMastery',
  ];

  return (
    <details className="rounded-xl border border-stone-200 bg-stone-50/80 dark:border-stone-700 dark:bg-stone-900/40">
      <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-stone-800 dark:text-stone-200">
        Terimler ne anlama geliyor?
      </summary>
      <dl className="space-y-3 border-t border-stone-200 px-4 py-3 dark:border-stone-700">
        {entries.map((key) => {
          const def = ANALYSIS_TERMS[key];
          return (
            <div key={key}>
              <dt className="text-xs font-bold text-stone-900 dark:text-stone-100">{def.title}</dt>
              <dd className="mt-0.5 text-xs leading-relaxed text-stone-600 dark:text-stone-400">{def.description}</dd>
            </div>
          );
        })}
      </dl>
    </details>
  );
}
