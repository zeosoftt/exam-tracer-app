'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Settings, Shield } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { AppBrandLink, AppHeaderActions, AppPageHeader } from '@/components/ui';
import type { PlanBadge } from '@/components/dashboard/domain/dashboardTypes';
import type { DashboardUser } from '@/components/dashboard/home/dashboardHomeTypes';

const ShopierCheckoutLink = dynamic(
  () => import('@/components/checkout/ShopierCheckoutLink').then((m) => m.ShopierCheckoutLink),
  { ssr: false },
);

type DashboardHeaderProps = {
  user: DashboardUser;
  planBadge: PlanBadge | null;
};

export function DashboardHeader({ user, planBadge }: DashboardHeaderProps) {
  const adminMobileBanner =
    user.role === 'ADMIN' ? (
      <div className="border-b border-primary-200 bg-primary-50 dark:border-primary-900 dark:bg-primary-950/40 sm:hidden">
        <Link
          href="/dashboard/super-admin"
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-primary-800 dark:text-primary-300"
        >
          <Shield className="h-4 w-4" />
          Super Admin
        </Link>
      </div>
    ) : null;

  return (
    <AppPageHeader
      zIndex="z-20"
      className="bg-white/95 dark:bg-stone-950/95"
      left={<AppBrandLink variant="solid" className="gap-2 sm:gap-3" />}
      right={
        <>
          {user.role === 'ADMIN' && (
            <Link
              href="/dashboard/super-admin"
              className="hidden items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-2 text-xs font-medium text-primary-800 hover:bg-primary-100 dark:bg-primary-950/50 dark:text-primary-300 dark:hover:bg-primary-950 sm:flex sm:text-sm"
            >
              <Shield className="h-4 w-4" />
              Super Admin
            </Link>
          )}
          <AppHeaderActions
            userName={user.name}
            showUserName
            showSupport={false}
            afterTheme={
              <Link
                href="/dashboard/settings"
                className="btn btn-secondary !px-2.5 !py-2 sm:!px-3"
                title="Ayarlar"
                aria-label="Ayarlara git"
              >
                <Settings className="h-4 w-4 text-stone-600 dark:text-stone-400" />
                <span className="ml-1.5 hidden text-xs font-semibold sm:inline">Ayarlar</span>
              </Link>
            }
            trailing={
              planBadge ? (
                planBadge.code === 'FREE' ? (
                  <ShopierCheckoutLink
                    className={cn(
                      'hidden items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold transition-opacity hover:opacity-90 sm:inline-flex',
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
                      'hidden items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold sm:inline-flex',
                      planBadge.bgClass,
                      planBadge.textClass,
                    )}
                    title={`${planBadge.label} planı`}
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full', planBadge.dotClass)} />
                    {planBadge.label}
                  </span>
                )
              ) : null
            }
          />
        </>
      }
      below={adminMobileBanner}
    />
  );
}
