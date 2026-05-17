import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { LandingReveal } from '@/components/landing/LandingReveal';

type LandingInlineCtaProps = {
  title: string;
  description: string;
  variant?: 'default' | 'dark';
};

/** Bölüm arası kompakt dönüşüm bandı. */
export function LandingInlineCta({
  title,
  description,
  variant = 'default',
}: LandingInlineCtaProps) {
  const isDark = variant === 'dark';

  return (
    <LandingReveal className="my-10 sm:my-12">
      <div
        className={
          isDark
            ? 'flex flex-col items-center gap-4 rounded-2xl border border-primary-700/50 bg-primary-900/40 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left'
            : 'flex flex-col items-center gap-4 rounded-2xl border border-primary-100 bg-primary-50/60 px-6 py-8 text-center dark:border-primary-900/40 dark:bg-primary-950/30 sm:flex-row sm:justify-between sm:text-left'
        }
      >
        <div className="max-w-xl">
          <p
            className={
              isDark
                ? 'font-display text-lg font-bold text-white sm:text-xl'
                : 'font-display text-lg font-bold text-stone-900 dark:text-stone-100 sm:text-xl'
            }
          >
            {title}
          </p>
          <p
            className={
              isDark
                ? 'mt-1 text-sm text-primary-100/90 sm:text-base'
                : 'mt-1 text-sm text-stone-600 dark:text-stone-300 sm:text-base'
            }
          >
            {description}
          </p>
        </div>
        <Link
          href="/onboarding"
          className={
            isDark
              ? 'group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary-800 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]'
              : 'group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/20 transition-transform hover:scale-[1.02] active:scale-[0.98]'
          }
        >
          Ücretsiz dene
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </LandingReveal>
  );
}
