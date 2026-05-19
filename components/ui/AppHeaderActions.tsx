'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { LifeBuoy, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ThemeToggleCompact } from '@/components/theme/ThemeToggleCompact';

type AppHeaderActionsProps = {
  userName?: string;
  /** Dashboard: btn-secondary; detail/pomodoro: bordered icon */
  supportVariant?: 'compact' | 'icon';
  showUserName?: boolean;
  /** `sm` = sadece geniş ekranda (dashboard); `always` = her zaman (detail) */
  userNameVisibility?: 'sm' | 'always';
  userNameClassName?: string;
  beforeTheme?: ReactNode;
  afterTheme?: ReactNode;
  trailing?: ReactNode;
};

export function AppHeaderSupportLink({ variant = 'compact' }: { variant?: 'compact' | 'icon' }) {
  if (variant === 'icon') {
    return (
      <Link
        href="/destek"
        className="rounded-xl border border-stone-200 p-2 text-stone-600 transition-colors hover:bg-stone-50 hover:text-primary-600 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-primary-400"
        title="Destek ve iletişim"
        aria-label="Destek ve iletişim"
      >
        <LifeBuoy className="h-[18px] w-[18px]" aria-hidden />
      </Link>
    );
  }

  return (
    <Link
      href="/destek"
      className="btn btn-secondary !px-2.5 !py-2 sm:!px-3"
      title="Destek ve iletişim"
      aria-label="Destek ve iletişim"
    >
      <LifeBuoy className="h-4 w-4 text-stone-600 dark:text-stone-400" />
      <span className="ml-1.5 hidden text-xs font-semibold sm:inline">Destek</span>
    </Link>
  );
}

export function AppHeaderSignOutButton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: '/' })}
        className="flex items-center gap-2 rounded-xl bg-stone-100 p-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700 sm:px-4 sm:py-2"
        title="Çıkış"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Çıkış</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/' })}
      className="btn btn-secondary !px-2.5 !py-2 text-xs sm:!px-4 sm:text-sm"
    >
      <LogOut className="h-4 w-4 sm:mr-1" />
      <span className="hidden sm:inline">Çıkış</span>
    </button>
  );
}

export function AppHeaderActions({
  userName,
  supportVariant = 'compact',
  showUserName = false,
  userNameVisibility = 'sm',
  userNameClassName,
  beforeTheme,
  afterTheme,
  trailing,
}: AppHeaderActionsProps) {
  return (
    <>
      {beforeTheme}
      <ThemeToggleCompact />
      {afterTheme}
      <AppHeaderSupportLink variant={supportVariant} />
      {showUserName && userName ? (
        <div
          className={cn(
            'items-center gap-2 text-xs text-stone-600 dark:text-stone-400 sm:text-sm',
            userNameVisibility === 'always' ? 'flex' : 'hidden sm:flex',
            userNameClassName,
          )}
        >
          <User className="h-4 w-4 shrink-0" />
          <span className="max-w-[140px] truncate font-medium lg:max-w-none">{userName}</span>
        </div>
      ) : null}
      {trailing}
      <AppHeaderSignOutButton compact={supportVariant === 'icon'} />
    </>
  );
}
