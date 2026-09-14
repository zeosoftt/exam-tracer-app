'use client';

import Link from 'next/link';
import {
  Users,
  BookOpen,
  Timer,
  ClipboardList,
  MousePointerClick,
  CreditCard,
  Settings,
  ScrollText,
  BarChart2,
} from 'lucide-react';
import { useAdminStats } from '@/components/super-admin/hooks/useSuperAdminPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export function SuperAdminOverview() {
  const { stats, isLoadingStats, statsLoadError } = useAdminStats();

  const kpi = stats
    ? [
        {
          label: 'Toplam Kullanıcı',
          value: stats.usersCount,
          icon: Users,
          iconClass: 'bg-primary/10 text-primary',
        },
        {
          label: 'Aktif Kullanıcı',
          value: stats.activeUsersCount,
          icon: Users,
          iconClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
        },
        {
          label: 'Sınav',
          value: stats.examsCount,
          icon: BookOpen,
          iconClass: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
        },
        {
          label: 'Pomodoro Oturum',
          value: stats.pomodoroSessionsCount,
          icon: Timer,
          iconClass: 'bg-primary/10 text-primary',
        },
        {
          label: 'Sınav Ataması',
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

  const links = [
    {
      href: '/dashboard/super-admin/users',
      title: 'Kullanıcılar',
      desc: 'Kayıtlı kullanıcı listesi',
      icon: Users,
    },
    {
      href: '/dashboard/super-admin/marketing',
      title: 'Pazarlama',
      desc: 'Huni ve etkileşim metrikleri',
      icon: BarChart2,
    },
    {
      href: '/dashboard/super-admin/plans',
      title: 'Planlar',
      desc: 'Plan dağılımı',
      icon: CreditCard,
    },
    {
      href: '/dashboard/super-admin/exam-content',
      title: 'Sınav içeriği',
      desc: 'Sınav ağacı yönetimi',
      icon: BookOpen,
    },
    {
      href: '/dashboard/super-admin/settings',
      title: 'Ayarlar',
      desc: 'Landing, fiyat, izleme',
      icon: Settings,
    },
    {
      href: '/dashboard/super-admin/audit',
      title: 'Denetim',
      desc: 'Audit log kayıtları',
      icon: ScrollText,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Sistem Özeti</h2>
        <p className="text-sm text-muted-foreground">KPI’lar ve yönetim alanlarına hızlı erişim</p>
      </div>

      {statsLoadError ? (
        <Alert variant="destructive">
          <AlertDescription>{statsLoadError}</AlertDescription>
        </Alert>
      ) : null}

      {isLoadingStats ? (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {kpi.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardDescription className="text-xs font-medium">{item.label}</CardDescription>
                  <div className={`rounded-md p-1.5 ${item.iconClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold tabular-nums">{item.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <section className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">Yönetim alanları</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.href} className="transition-colors hover:border-primary/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-4 w-4 text-primary" />
                    {item.title}
                  </CardTitle>
                  <CardDescription>{item.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild size="sm">
                    <Link href={item.href}>Aç</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/** @deprecated Use SuperAdminOverview */
export const SuperAdminPanel = SuperAdminOverview;
