'use client';

import type { MarketingFunnelStats } from '@/lib/marketing/getMarketingFunnelStats';
import { formatDurationSeconds } from '@/lib/marketing/sessionEngagementTypes';
import {
  TrendingUp,
  MousePointerClick,
  ShoppingBag,
  Users,
  Target,
  BarChart2,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type Props = {
  marketing: MarketingFunnelStats | undefined;
  loading?: boolean;
};

function pct(value: number | null | undefined): string {
  if (value == null) return '—';
  return `%${value}`;
}

export function MarketingMetricsSection({ marketing, loading }: Props) {
  if (loading) {
    return <Skeleton className="mb-8 h-48 rounded-xl" aria-hidden />;
  }

  if (!marketing) return null;

  const { engagement } = marketing;

  const funnel = [
    { label: 'Landing görüntüleme', value: marketing.eventCounts.landing_view ?? 0 },
    { label: 'CTA tıklama', value: marketing.eventCounts.cta_click ?? 0 },
    { label: 'Onboarding tamamlandı', value: marketing.eventCounts.onboarding_complete ?? 0 },
    { label: 'Kayıt (sign_up)', value: marketing.eventCounts.sign_up ?? 0 },
    { label: 'Kurulum bitti', value: marketing.eventCounts.setup_wizard_complete ?? 0 },
    { label: 'Premium duvar görüntüleme', value: marketing.eventCounts.premium_wall_view ?? 0 },
    { label: 'Shopier tıklama', value: marketing.shopierCheckoutClicks },
    { label: 'Satın alma (webhook)', value: marketing.purchasesTotal },
  ];

  const summary = [
    {
      label: 'Kayıt (7 gün)',
      value: marketing.signupsLast7Days,
      sub: `30 gün: ${marketing.signupsLast30Days}`,
      icon: Users,
    },
    {
      label: 'FREE → PRO oranı',
      value: pct(marketing.conversionRatePct),
      sub: `Pro: ${marketing.proUsers} · Free: ${marketing.freeUsers}`,
      icon: Target,
    },
    {
      label: 'Shopier tıklama',
      value: marketing.shopierCheckoutClicks,
      sub: `Dönüşüm: ${pct(marketing.checkoutToPurchaseRatePct)}`,
      icon: MousePointerClick,
    },
    {
      label: 'Tahmini gelir',
      value: `${marketing.estimatedRevenueTry.toLocaleString('tr-TR')} ₺`,
      sub: `${marketing.purchasesTotal} satın alma`,
      icon: ShoppingBag,
    },
  ];

  const engagementCards = [
    {
      label: 'Ort. oturum (7 gün)',
      value: formatDurationSeconds(engagement.avgDurationSeconds7d),
      sub: `Medyan: ${formatDurationSeconds(engagement.medianDurationSeconds7d)}`,
      icon: Clock,
    },
    {
      label: 'Oturum sayısı (7 gün)',
      value: engagement.sessionsLast7Days,
      sub: `30 gün: ${engagement.sessionsLast30Days}`,
      icon: Users,
    },
    {
      label: 'Toplam süre (7 gün)',
      value: `${engagement.totalDurationMinutes7d.toLocaleString('tr-TR')} dk`,
      sub: `Ort. 30 gün: ${formatDurationSeconds(engagement.avgDurationSeconds30d)}`,
      icon: Clock,
    },
    {
      label: 'Giriş yapmış kullanıcı (7 gün)',
      value: engagement.uniqueUsersLast7Days,
      sub: 'Sekme oturumu bazlı ölçüm',
      icon: Users,
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart2 className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-bold tracking-tight">Satış & Pazarlama Hunisi</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold tabular-nums">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {engagementCards.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold tabular-nums">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Huni adımları (first-party)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {funnel.map((row) => (
                <li
                  key={row.label}
                  className="flex justify-between gap-4 border-b border-border pb-2 last:border-0"
                >
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-semibold tabular-nums">{row.value}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shopier tıklama — kaynak</CardTitle>
            </CardHeader>
            <CardContent>
              {marketing.checkoutByTouchpoint.length === 0 ? (
                <p className="text-sm text-muted-foreground">Henüz touchpoint verisi yok.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {marketing.checkoutByTouchpoint.map((row) => (
                    <li key={row.touchpoint} className="flex justify-between gap-4">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-semibold tabular-nums">{row.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bizi nereden duydunuz?</CardTitle>
            </CardHeader>
            <CardContent>
              {marketing.acquisitionSources.length === 0 ? (
                <p className="text-sm text-muted-foreground">Veri yok.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {marketing.acquisitionSources.slice(0, 8).map((row) => (
                    <li key={row.source} className="flex justify-between gap-4">
                      <span className="text-muted-foreground">{row.source}</span>
                      <span className="font-semibold tabular-nums">{row.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
