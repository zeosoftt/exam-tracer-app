'use client';

import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

type FlashMessageProps = {
  type: 'success' | 'error';
  children: ReactNode;
  variant?: 'filled' | 'bordered';
  className?: string;
};

export function FlashMessage({ type, children, variant = 'filled', className }: FlashMessageProps) {
  const isSuccess = type === 'success';

  return (
    <div
      role="alert"
      className={cn(
        'mb-6 flex items-center gap-2 rounded-xl px-4 py-3 text-sm',
        variant === 'bordered' && 'border',
        isSuccess
          ? variant === 'bordered'
            ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-200'
            : 'bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-200'
          : variant === 'bordered'
            ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200'
            : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200',
        className,
      )}
    >
      {variant === 'filled' ? (
        isSuccess ? (
          <CheckCircle className="h-5 w-5 shrink-0" aria-hidden />
        ) : (
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden />
        )
      ) : null}
      <span>{children}</span>
    </div>
  );
}
