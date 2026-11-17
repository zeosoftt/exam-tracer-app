'use client';

import type { ComponentType } from 'react';
import type { MarketingFunnelStats } from '@/lib/marketing/getMarketingFunnelStats';
import { formatDurationSeconds } from '@/lib/marketing/sessionEngagementTypes';
import {
  TrendingUp,
  MousePointerClick,
  ShoppingBag,
  Users,
  Target,
  Clock,
  Activity,
  Megaphone,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type Props = {
  marketing: MarketingFunnelStats | undefined;
  loading?: boolean;
};

type MetricItem = {
  label: string;
  value: string | number;
  sub: string;
  icon: ComponentType<{ className?: string }>;
};

const numberFormat = new Intl.NumberFormat('tr-TR');

function pct(value: number | null | undefined): string {
  if (value == null) return '—';
  return `%${value}`;
}

function fmt(value: string | number): string {
  return typeof value === 'number' ? numberFormat.format(value) : value;
}

function MetricGrid({ items }: { items: MetricItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label}>
            <CardHeader className="p-4 pb-2">
              <CardDescription className="flex items-center gap-2 text-xs font-medium">
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="truncate">{item.label}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-bold tabular-nums tracking-tight">{fmt(item.value)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.sub}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function RankedList({
  rows,
  emptyText,
}: {
  rows: { key: string; label: string; count: number }[];
  emptyText: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <ul className="space-y-2.5 text-sm">
      {rows.map((row) => (
        <li key={row.key} className="space-y-1">
          <div className="flex justify-between gap-4">
            <span className="truncate text-muted-foreground">{row.label}</span>
            <span className="shrink-0 font-semibold tabular-nums">{numberFormat.format(row.count)}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
            <div
              className="h-full rounded-full bg-primary/70"
              style={{ width: `${Math.max(2, (row.count / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function SectionTitle({
  icon: Icon,
  children,
  id,
}: {
  icon: ComponentType<{ className?: string }>;
  children: string;
  id: string;
}) {
  return (
    <h2 id={id} className="flex items-center gap-2 text-base font-semibold tracking-tight">
      <Icon className="h-4 w-4 text-primary" aria-hidden />
      {children}
    </h2>
  );
}

export function MarketingMetricsSection({ marketing, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-8" role="status" aria-busy="true" aria-label="Yükleniyor">
        <div className="space-y-3">
          <Skeleton className="h-5 w-48" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[116px] rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-48" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[116px] rounded-xl" />
            ))}
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
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
  const funnelMax = Math.max(...funnel.map((f) => f.value), 1);

  const summary: MetricItem[] = [
    {
      label: 'Kayıt (7 gün)',
      value: marketing.signupsLast7Days,
      sub: `30 gün: ${numberFormat.format(marketing.signupsLast30Days)}`,
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
      value: `${numberFormat.format(marketing.estimatedRevenueTry)} ₺`,
      sub: `${marketing.purchasesTotal} satın alma`,
      icon: ShoppingBag,
    },
  ];

  const engagementCards: MetricItem[] = [
    {
      label: 'Ort. oturum (7 gün)',
      value: formatDurationSeconds(engagement.avgDurationSeconds7d),
      sub: `Medyan: ${formatDurationSeconds(engagement.medianDurationSeconds7d)}`,
      icon: Clock,
    },
    {
      label: 'Oturum sayısı (7 gün)',
      value: engagement.sessionsLast7Days,
      sub: `30 gün: ${numberFormat.format(engagement.sessionsLast30Days)}`,
      icon: Activity,
    },
    {
      label: 'Toplam süre (7 gün)',
      value: `${numberFormat.format(engagement.totalDurationMinutes7d)} dk`,
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
    <div className="space-y-8">
      <section aria-labelledby="mk-sales" className="space-y-3">
        <SectionTitle id="mk-sales" icon={TrendingUp}>
          Satış & dönüşüm
        </SectionTitle>
        <MetricGrid items={summary} />
      </section>

      <section aria-labelledby="mk-engagement" className="space-y-3">
        <SectionTitle id="mk-engagement" icon={Activity}>
          Uygulama içi etkileşim
        </SectionTitle>
        <MetricGrid items={engagementCards} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" aria-hidden />
              Huni adımları
            </CardTitle>
            <CardDescription>First-party olay sayıları, yukarıdan aşağıya akış</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2.5 text-sm">
              {funnel.map((row, index) => (
                <li key={row.label} className="space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold tabular-nums text-foreground">
                        {index + 1}
                      </span>
                      <span className="truncate">{row.label}</span>
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums">
                      {numberFormat.format(row.value)}
                    </span>
                  </div>
                  <div className="ml-7 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                    <div
                      className="h-full rounded-full bg-primary/70"
                      style={{ width: `${Math.max(2, (row.value / funnelMax) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MousePointerClick className="h-4 w-4 text-primary" aria-hidden />
                Shopier tıklama kaynağı
              </CardTitle>
              <CardDescription>Hangi temas noktasından ödemeye gidildi</CardDescription>
            </CardHeader>
            <CardContent>
              <RankedList
                rows={marketing.checkoutByTouchpoint.map((r) => ({
                  key: r.touchpoint,
                  label: r.label,
                  count: r.count,
                }))}
                emptyText="Henüz touchpoint verisi yok."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Megaphone className="h-4 w-4 text-primary" aria-hidden />
                Bizi nereden duydunuz?
              </CardTitle>
              <CardDescription>Onboarding’de seçilen kaynaklar (ilk 8)</CardDescription>
            </CardHeader>
            <CardContent>
              <RankedList
                rows={marketing.acquisitionSources.slice(0, 8).map((r) => ({
                  key: r.source,
                  label: r.source,
                  count: r.count,
                }))}
                emptyText="Veri yok."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
