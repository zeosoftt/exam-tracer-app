'use client';

import { useEffect, useState } from 'react';
import { X, Sparkles, TrendingUp, BarChart3, Target } from 'lucide-react';
import dynamic from 'next/dynamic';
import { ProUpgradeCard } from '@/components/checkout/ProUpgradeCard';
import { ShopierCheckoutHint } from '@/components/checkout/ShopierCheckoutHint';
import { MARKETING_TOUCHPOINTS } from '@/lib/marketing/touchpoints';
import { trackPremiumWallViewOnce } from '@/lib/marketing/trackMarketingEvent';
import { ProPlanPriceText } from '@/components/marketing/ProPlanPriceText';

const ShopierCheckoutLink = dynamic(
  () => import('@/components/checkout/ShopierCheckoutLink').then((m) => m.ShopierCheckoutLink),
  { ssr: false, loading: () => null },
);

type Props = {
  userEmail?: string | null;
  denemeCount?: number;
};

const DISMISS_KEY = 'pro_banner_dismissed_until';

export function FreeUserUpgradeBanner({ userEmail, denemeCount = 0 }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const until = sessionStorage.getItem(DISMISS_KEY);
      if (until && Date.now() < parseInt(until, 10)) return;
    } catch {
      // ignore
    }
    setVisible(true);
    trackPremiumWallViewOnce(MARKETING_TOUCHPOINTS.DASHBOARD_BANNER);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, String(Date.now() + 24 * 60 * 60 * 1000));
    } catch {
      // ignore
    }
    setVisible(false);
  };

  const headline =
    denemeCount >= 2
      ? `${denemeCount} deneme kaydın var — detay analizi Pro ile açılır`
      : 'Pro ile deneme analizi ve konu bazlı net takibini aç';

  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-primary-200 bg-gradient-to-r from-primary-50 via-white to-amber-50/80 p-5 shadow-sm dark:border-primary-800 dark:from-primary-950/40 dark:via-stone-900 dark:to-amber-950/20 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 gap-4">
          <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white sm:flex">
            <Sparkles className="h-6 w-6" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300">
              Pro — <ProPlanPriceText withPeriod />
            </p>
            <h2 className="mt-1 font-display text-lg font-bold text-stone-900 dark:text-stone-100">{headline}</h2>
            <ul className="mt-3 grid gap-2 text-sm text-stone-600 dark:text-stone-400 sm:grid-cols-3">
              <li className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 shrink-0 text-primary-600" aria-hidden />
                Deneme detay & konu analizi
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 shrink-0 text-primary-600" aria-hidden />
                Net trendi & puan hesabı
              </li>
              <li className="flex items-center gap-2">
                <Target className="h-4 w-4 shrink-0 text-primary-600" aria-hidden />
                Hedef puanına ne kadar kaldı?
              </li>
            </ul>
            <ShopierCheckoutHint className="mt-4" userEmail={userEmail} compact />
            <div className="mt-4 flex flex-wrap gap-3">
              <ShopierCheckoutLink
                touchpoint={MARKETING_TOUCHPOINTS.DASHBOARD_BANNER}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:opacity-95"
              >
                Pro&apos;yu satın al
              </ShopierCheckoutLink>
              <button
                type="button"
                onClick={dismiss}
                className="text-sm font-medium text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
              >
                24 saat gizle
              </button>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800"
          aria-label="Kapat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}

/** Kompakt inline upsell (ayarlar vb.) */
export function FreeUserUpgradeInline({ userEmail, touchpoint }: { userEmail?: string | null; touchpoint: string }) {
  return (
    <ProUpgradeCard
      userEmail={userEmail}
      touchpoint={touchpoint}
      title="Pro ile tüm analizleri aç"
      description="Deneme detayı, ders/konu kırılımı ve gelişmiş puan takibi — sınav hazırlığında fark yaratır."
    />
  );
}
