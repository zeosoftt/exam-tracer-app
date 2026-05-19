'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { BookOpen, LifeBuoy, LogOut, User } from 'lucide-react';
import { ThemeToggleCompact } from '@/components/theme/ThemeToggleCompact';
import type { DashboardUser } from '@/components/dashboard/home/dashboardHomeTypes';

type DashboardDetailHeaderProps = {
  user: DashboardUser;
};

export function DashboardDetailHeader({ user }: DashboardDetailHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/80 shadow-sm backdrop-blur-sm dark:border-stone-800 dark:bg-stone-950/90">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-2 sm:h-16">
          <Link href="/dashboard" className="group flex min-w-0 items-center gap-1.5 sm:gap-2">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 opacity-75 blur transition group-hover:opacity-100" />
              <BookOpen className="relative h-5 w-5 text-primary-600 dark:text-primary-400 sm:h-6 sm:w-6" />
            </div>
            <span className="truncate text-base font-bold text-stone-900 dark:text-stone-100 sm:text-xl">The Goal Lab</span>
          </Link>
          <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/destek"
              className="rounded-xl border border-stone-200 p-2 text-stone-600 transition-colors hover:bg-stone-50 hover:text-primary-600 dark:border-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-primary-400"
              title="Destek ve iletişim"
              aria-label="Destek ve iletişim"
            >
              <LifeBuoy className="h-[18px] w-[18px]" aria-hidden />
            </Link>
            <ThemeToggleCompact />
            <div className="flex min-w-0 items-center gap-1.5 text-sm text-stone-600 dark:text-stone-400 sm:gap-2">
              <User className="h-4 w-4 flex-shrink-0" />
              <span className="max-w-[100px] truncate font-medium sm:max-w-none">{user.name}</span>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-2 rounded-xl bg-stone-100 p-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700 sm:px-4 sm:py-2"
              title="Çıkış"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
