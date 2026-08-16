'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import type { AdminSiteSettings } from '@/lib/siteSettings';
import { buildProPlanPriceLabels } from '@/lib/marketing/pricingDisplay';

type PricingDraft = Pick<
  AdminSiteSettings,
  'pro_plan_price_try' | 'pro_plan_billing_period' | 'shopier_checkout_url'
>;

type Props = {
  settings: AdminSiteSettings | null;
  loading: boolean;
  patching: boolean;
  onSave: (patch: Partial<AdminSiteSettings>) => Promise<void>;
};

export function PricingSettingsSection({ settings, loading, patching, onSave }: Props) {
  const [draft, setDraft] = useState<PricingDraft | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setDraft({
      pro_plan_price_try: settings.pro_plan_price_try,
      pro_plan_billing_period: settings.pro_plan_billing_period,
      shopier_checkout_url: settings.shopier_checkout_url,
    });
  }, [settings]);

  if (loading || !draft) {
    return (
      <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Yükleniyor...</span>
      </div>
    );
  }

  const preview = buildProPlanPriceLabels(draft.pro_plan_price_try, draft.pro_plan_billing_period);

  const handleSave = async () => {
    setSaved(false);
    await onSave(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl space-y-5 rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/90">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-stone-900 dark:text-stone-100">Pro fiyat (₺)</span>
          <input
            type="number"
            min={1}
            max={999999}
            step={1}
            value={draft.pro_plan_price_try}
            onChange={(e) =>
              setDraft((d) =>
                d ? { ...d, pro_plan_price_try: Number.parseFloat(e.target.value) || 0 } : d,
              )
            }
            disabled={patching}
            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-stone-900 dark:text-stone-100">Dönem</span>
          <input
            type="text"
            maxLength={32}
            value={draft.pro_plan_billing_period}
            onChange={(e) =>
              setDraft((d) => (d ? { ...d, pro_plan_billing_period: e.target.value } : d))
            }
            placeholder="6 ay"
            disabled={patching}
            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-stone-900 dark:text-stone-100">Shopier ödeme linki</span>
        <input
          type="url"
          value={draft.shopier_checkout_url}
          onChange={(e) => setDraft((d) => (d ? { ...d, shopier_checkout_url: e.target.value } : d))}
          placeholder="https://www.shopier.com/..."
          disabled={patching}
          className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
        />
        <p className="text-xs text-stone-500 dark:text-stone-400">
          Landing, dashboard ve deneme sayfalarındaki &quot;Satın al&quot; butonları bu URL&apos;yi kullanır.
        </p>
      </label>

      <p className="rounded-xl bg-primary-50 px-3 py-2 text-sm font-medium text-primary-900 dark:bg-primary-950/40 dark:text-primary-200">
        Önizleme: {preview.priceLabelWithPeriod}
      </p>

      <div className="flex items-center gap-3 border-t border-stone-100 pt-4 dark:border-stone-800">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={patching || draft.pro_plan_price_try <= 0 || !draft.pro_plan_billing_period.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {patching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Kaydet
        </button>
        {saved ? (
          <span className="text-sm text-primary-700 dark:text-primary-300">
            Kaydedildi — bir sonraki sayfa yüklemesinde geçerli olur.
          </span>
        ) : null}
      </div>
    </div>
  );
}
