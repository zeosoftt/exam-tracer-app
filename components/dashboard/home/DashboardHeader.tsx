'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { BookOpen, LifeBuoy, LogOut, RefreshCw, Shield, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ThemeToggleCompact } from '@/components/theme/ThemeToggleCompact';
import type { PlanBadge } from '@/components/dashboard/domain/dashboardTypes';
import type { DashboardUser } from '@/components/dashboard/home/dashboardHomeTypes';

const ShopierCheckoutLink = dynamic(
  () => import('@/components/checkout/ShopierCheckoutLink').then((m) => m.ShopierCheckoutLink),
  { ssr: false },
);

type DashboardHeaderProps = {
  user: DashboardUser;
  planBadge: PlanBadge | null;
  statsRefreshing: boolean;
  isLoading: boolean;
  onRefresh: () => void;
};

export function DashboardHeader({
  user,
  planBadge,
  statsRefreshing,
  isLoading,
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/95">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-2 sm:h-16">
            <Link href="/dashboard" className="group flex min-w-0 items-center gap-2 sm:gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white sm:h-10 sm:w-10">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span className="font-display truncate text-lg font-bold sm:text-xl">The Goal Lab</span>
            </Link>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              {user.role === 'ADMIN' && (
                <Link
                  href="/dashboard/super-admin"
                  className="hidden items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-2 text-xs font-medium text-primary-800 hover:bg-primary-100 dark:bg-primary-950/50 dark:text-primary-300 dark:hover:bg-primary-950 sm:flex sm:text-sm"
                >
                  <Shield className="h-4 w-4" />
                  Super Admin
                </Link>
              )}
              <ThemeToggleCompact />
              <Link
                href="/destek"
                className="btn btn-secondary !px-2.5 !py-2 sm:!px-3"
                title="Destek ve iletişim"
                aria-label="Destek ve iletişim"
              >
                <LifeBuoy className="h-4 w-4 text-stone-600 dark:text-stone-400" />
                <span className="ml-1.5 hidden text-xs font-semibold sm:inline">Destek</span>
              </Link>
              <button
                type="button"
                onClick={onRefresh}
                disabled={statsRefreshing || isLoading}
                className="btn btn-secondary !px-2.5 !py-2 sm:!px-3"
                title="Verileri yenile"
                aria-label="Dashboard verilerini yenile"
              >
                <RefreshCw
                  className={cn('h-4 w-4 text-stone-600 dark:text-stone-400', statsRefreshing && 'animate-spin')}
                />
              </button>
              <div className="hidden items-center gap-2 text-xs text-stone-600 dark:text-stone-400 sm:flex sm:text-sm">
                <User className="h-4 w-4 shrink-0" />
                <span className="max-w-[140px] truncate font-medium lg:max-w-none">{user.name}</span>
                {planBadge &&
                  (planBadge.code === 'FREE' ? (
                    <ShopierCheckoutLink
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold transition-opacity hover:opacity-90',
                        planBadge.bgClass,
                        planBadge.textClass,
                      )}
                      title="Pro planı Shopier üzerinden satın al"
                    >
                      <span className={cn('h-1.5 w-1.5 rounded-full', planBadge.dotClass)} />
                      {planBadge.label}
                    </ShopierCheckoutLink>
                  ) : (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                        planBadge.bgClass,
                        planBadge.textClass,
                      )}
                      title={`${planBadge.label} planı`}
                    >
                      <span className={cn('h-1.5 w-1.5 rounded-full', planBadge.dotClass)} />
                      {planBadge.label}
                    </span>
                  ))}
              </div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="btn btn-secondary !px-2.5 !py-2 text-xs sm:!px-4 sm:text-sm"
              >
                <LogOut className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {user.role === 'ADMIN' && (
        <div className="border-b border-primary-200 bg-primary-50 dark:border-primary-900 dark:bg-primary-950/40 sm:hidden">
          <Link
            href="/dashboard/super-admin"
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-primary-800 dark:text-primary-300"
          >
            <Shield className="h-4 w-4" />
            Super Admin
          </Link>
        </div>
      )}
    </>
  );
}
