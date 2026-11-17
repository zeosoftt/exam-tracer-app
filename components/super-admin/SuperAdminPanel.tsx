'use client';

import Link from 'next/link';
import {
  Users,
  UserCheck,
  BookOpen,
  Timer,
  ClipboardList,
  MousePointerClick,
  ArrowRight,
} from 'lucide-react';
import { useAdminStats } from '@/components/super-admin/hooks/useSuperAdminPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminPageHeader } from '@/components/super-admin/layout/AdminPageHeader';
import { AdminErrorAlert } from '@/components/super-admin/layout/AdminErrorAlert';
import { ADMIN_NAV_ITEMS, ADMIN_ROOT } from '@/components/super-admin/layout/adminNav';

const overview = ADMIN_NAV_ITEMS.find((i) => i.href === ADMIN_ROOT);
const areaLinks = ADMIN_NAV_ITEMS.filter((i) => i.href !== ADMIN_ROOT);

const numberFormat = new Intl.NumberFormat('tr-TR');

export function SuperAdminOverview() {
  const { stats, isLoadingStats, statsLoadError, reloadStats } = useAdminStats();

  const kpi = stats
    ? [
        {
          label: 'Toplam kullanıcı',
          value: stats.usersCount,
          icon: Users,
          iconClass: 'bg-primary/10 text-primary',
        },
        {
          label: 'Aktif kullanıcı',
          value: stats.activeUsersCount,
          icon: UserCheck,
          iconClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
        },
        {
          label: 'Sınav',
          value: stats.examsCount,
          icon: BookOpen,
          iconClass: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
        },
        {
          label: 'Pomodoro oturumu',
          value: stats.pomodoroSessionsCount,
          icon: Timer,
          iconClass: 'bg-primary/10 text-primary',
        },
        {
          label: 'Sınav ataması',
          value: stats.examAssignmentsCount,
          icon: ClipboardList,
          iconClass: 'bg-primary/10 text-primary',
        },
        {
          label: 'Shopier tıklama',
          value: stats.shopierCheckoutClicks ?? 0,
          icon: MousePointerClick,
          iconClass: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={overview?.title ?? 'Sistem Özeti'}
        description={overview?.description}
      />

      {statsLoadError ? (
        <AdminErrorAlert
          message={statsLoadError}
          onRetry={() => void reloadStats()}
          retrying={isLoadingStats}
        />
      ) : null}

      <section aria-labelledby="kpi-heading" className="space-y-3">
        <h2 id="kpi-heading" className="sr-only">
          Temel göstergeler
        </h2>
        {isLoadingStats ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[108px] rounded-xl" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {kpi.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.label}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-2">
                    <CardDescription className="text-xs font-medium leading-tight">
                      {item.label}
                    </CardDescription>
                    <span className={`shrink-0 rounded-md p-1.5 ${item.iconClass}`} aria-hidden>
                      <Icon className="h-4 w-4" />
                    </span>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold tabular-nums tracking-tight">
                      {numberFormat.format(item.value)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : null}
      </section>

      <section aria-labelledby="areas-heading" className="space-y-4">
        <h2 id="areas-heading" className="text-lg font-semibold tracking-tight">
          Yönetim alanları
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {areaLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Card className="h-full transition-colors group-hover:border-primary/40 group-hover:bg-muted/30">
                  <CardHeader className="flex h-full flex-row items-start gap-3 space-y-0">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                    </div>
                    <ArrowRight
                      className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                      aria-hidden
                    />
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/** @deprecated Use SuperAdminOverview */
export const SuperAdminPanel = SuperAdminOverview;
