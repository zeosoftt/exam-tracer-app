'use client';

import type { MarketingFunnelStats } from '@/lib/marketing/getMarketingFunnelStats';
import { TrendingUp, MousePointerClick, ShoppingBag, Users, Target, BarChart2 } from 'lucide-react';

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
    return (
      <div className="mb-8 h-48 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" aria-hidden />
    );
  }

  if (!marketing) return null;

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

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-2">
        <BarChart2 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Satış & Pazarlama Hunisi</h2>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900/90">
          <div className="mb-1 flex items-center gap-2 text-sm text-stone-500">
            <Users className="h-4 w-4" /> Kayıt (7 gün)
          </div>
          <p className="text-2xl font-bold">{marketing.signupsLast7Days}</p>
          <p className="text-xs text-stone-500">30 gün: {marketing.signupsLast30Days}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900/90">
          <div className="mb-1 flex items-center gap-2 text-sm text-stone-500">
            <Target className="h-4 w-4" /> FREE → PRO oranı
          </div>
          <p className="text-2xl font-bold">{pct(marketing.conversionRatePct)}</p>
          <p className="text-xs text-stone-500">Pro: {marketing.proUsers} · Free: {marketing.freeUsers}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900/90">
          <div className="mb-1 flex items-center gap-2 text-sm text-stone-500">
            <MousePointerClick className="h-4 w-4" /> Shopier tıklama
          </div>
          <p className="text-2xl font-bold">{marketing.shopierCheckoutClicks}</p>
          <p className="text-xs text-stone-500">
            Dönüşüm: {pct(marketing.checkoutToPurchaseRatePct)}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900/90">
          <div className="mb-1 flex items-center gap-2 text-sm text-stone-500">
            <ShoppingBag className="h-4 w-4" /> Tahmini gelir
          </div>
          <p className="text-2xl font-bold">{marketing.estimatedRevenueTry.toLocaleString('tr-TR')} ₺</p>
          <p className="text-xs text-stone-500">{marketing.purchasesTotal} satın alma</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900/90">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-stone-900 dark:text-stone-100">
            <TrendingUp className="h-4 w-4 text-primary-600" />
            Huni adımları (first-party)
          </h3>
          <ul className="space-y-2 text-sm">
            {funnel.map((row) => (
              <li key={row.label} className="flex justify-between gap-4 border-b border-stone-100 pb-2 dark:border-stone-800">
                <span className="text-stone-600 dark:text-stone-400">{row.label}</span>
                <span className="font-semibold tabular-nums">{row.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900/90">
            <h3 className="mb-3 font-semibold text-stone-900 dark:text-stone-100">Shopier tıklama — kaynak</h3>
            {marketing.checkoutByTouchpoint.length === 0 ? (
              <p className="text-sm text-stone-500">Henüz touchpoint verisi yok.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {marketing.checkoutByTouchpoint.map((row) => (
                  <li key={row.touchpoint} className="flex justify-between gap-4">
                    <span className="text-stone-600 dark:text-stone-400">{row.label}</span>
                    <span className="font-semibold tabular-nums">{row.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900/90">
            <h3 className="mb-3 font-semibold text-stone-900 dark:text-stone-100">Bizi nereden duydunuz?</h3>
            {marketing.acquisitionSources.length === 0 ? (
              <p className="text-sm text-stone-500">Veri yok.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {marketing.acquisitionSources.slice(0, 8).map((row) => (
                  <li key={row.source} className="flex justify-between gap-4">
                    <span className="text-stone-600 dark:text-stone-400">{row.source}</span>
                    <span className="font-semibold tabular-nums">{row.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
