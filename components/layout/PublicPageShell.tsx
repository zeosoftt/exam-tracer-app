import type { ReactNode } from 'react';
import { MarketingHeader } from '@/components/layout/MarketingHeader';
import { MarketingFooter } from '@/components/layout/MarketingFooter';
import { cn } from '@/lib/utils/cn';

type PublicPageShellProps = {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
  showFooter?: boolean;
  className?: string;
};

const MAX_WIDTH_CLASS = {
  sm: 'max-w-xl',
  md: 'max-w-3xl',
  lg: 'max-w-7xl',
} as const;

export function PublicPageShell({
  children,
  maxWidth = 'md',
  showFooter = true,
  className,
}: PublicPageShellProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden text-stone-900 dark:text-stone-100">
      <div className="landing-vibe-mesh absolute inset-0" aria-hidden />
      <div className="landing-dot-grid absolute inset-0 opacity-[0.2] dark:opacity-[0.08]" aria-hidden />
      <div className="landing-grain pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.06]" aria-hidden />
      <div
        className="landing-orb pointer-events-none absolute -right-20 top-32 h-64 w-64 rounded-full bg-primary-400/10 blur-3xl"
        aria-hidden
      />
      <div
        className="landing-orb landing-orb--amber pointer-events-none absolute -left-16 bottom-32 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl"
        aria-hidden
      />

      <div className="relative flex min-h-screen flex-col">
        <MarketingHeader />
        <main
          className={cn(
            'relative mx-auto w-full flex-1 px-4 pb-12 pt-20 sm:px-6 sm:pb-16 sm:pt-28 lg:px-8',
            MAX_WIDTH_CLASS[maxWidth],
            className,
          )}
        >
          {children}
        </main>
        {showFooter ? <MarketingFooter /> : null}
      </div>
    </div>
  );
}
