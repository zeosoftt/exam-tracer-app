'use client';

import dynamic from 'next/dynamic';
import { Sparkles } from 'lucide-react';
import { PRO_PLAN_MARKETING_FEATURES, getProPlanPriceLabel } from '@/lib/marketing/pricingDisplay';
import { MARKETING_TOUCHPOINTS } from '@/lib/marketing/touchpoints';
import { ShopierCheckoutHint } from '@/components/checkout/ShopierCheckoutHint';
import { cn } from '@/lib/utils/cn';

const ShopierCheckoutLink = dynamic(
  () => import('@/components/checkout/ShopierCheckoutLink').then((m) => m.ShopierCheckoutLink),
  { ssr: false, loading: () => null },
);

type Props = {
  className?: string;
  userEmail?: string | null;
  title?: string;
  description?: string;
  touchpoint?: string;
};

export function ProUpgradeCard({
  className,
  userEmail,
  title = 'Pro ile analizleri aç',
  description = 'Deneme detayı, konu analizi ve gelişmiş puan takibi Pro planda.',
  touchpoint = MARKETING_TOUCHPOINTS.SETUP_WIZARD,
}: Props) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50/90 to-white p-5 dark:border-primary-800 dark:from-primary-950/40 dark:to-stone-900/80',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white shadow-md">
          <Sparkles className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-stone-900 dark:text-stone-100">{title}</p>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{description}</p>
          <p className="mt-2 text-lg font-bold text-primary-800 dark:text-primary-200">{getProPlanPriceLabel({ withPeriod: true })}</p>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Taahhüt yok · Ödeme sonrası birkaç dakika içinde otomatik aktifleşir
          </p>
          <ul className="mt-3 space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
            {PRO_PLAN_MARKETING_FEATURES.map((line) => (
              <li key={line}>• {line}</li>
            ))}
          </ul>
        </div>
      </div>
      <ShopierCheckoutHint className="mt-4" userEmail={userEmail} compact />
      <ShopierCheckoutLink
        touchpoint={touchpoint}
        className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 py-3 text-sm font-bold text-white shadow-md transition-opacity hover:opacity-95"
      >
        Pro&apos;yu Shopier&apos;da satın al
      </ShopierCheckoutLink>
    </div>
  );
}
