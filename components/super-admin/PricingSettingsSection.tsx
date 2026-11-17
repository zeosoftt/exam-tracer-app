'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2, Save, Tag } from 'lucide-react';
import type { AdminSiteSettings } from '@/lib/siteSettings';
import { buildProPlanPriceLabels } from '@/lib/marketing/pricingDisplay';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AdminFormSkeleton } from '@/components/super-admin/layout/AdminLoading';

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

function isDirty(draft: PricingDraft, settings: AdminSiteSettings | null): boolean {
  if (!settings) return false;
  return (
    draft.pro_plan_price_try !== settings.pro_plan_price_try ||
    draft.pro_plan_billing_period !== settings.pro_plan_billing_period ||
    draft.shopier_checkout_url !== settings.shopier_checkout_url
  );
}

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

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2500);
    return () => clearTimeout(t);
  }, [saved]);

  const header = (
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-base">
        <Tag className="h-4 w-4 text-primary" aria-hidden />
        Pro fiyatlandırma
      </CardTitle>
      <CardDescription>
        Landing, dashboard ve deneme sayfalarındaki fiyat etiketi ve &quot;Satın al&quot; bağlantısı.
      </CardDescription>
    </CardHeader>
  );

  if (loading || !draft) {
    return (
      <Card>
        {header}
        <CardContent>
          <AdminFormSkeleton fields={3} />
        </CardContent>
      </Card>
    );
  }

  const preview = buildProPlanPriceLabels(draft.pro_plan_price_try, draft.pro_plan_billing_period);
  const dirty = isDirty(draft, settings);
  const invalid = draft.pro_plan_price_try <= 0 || !draft.pro_plan_billing_period.trim();

  const handleSave = async () => {
    setSaved(false);
    await onSave(draft);
    setSaved(true);
  };

  return (
    <Card>
      {header}
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pro_plan_price_try">Pro fiyat (₺)</Label>
            <Input
              id="pro_plan_price_try"
              type="number"
              inputMode="decimal"
              min={1}
              max={999999}
              step={1}
              value={draft.pro_plan_price_try}
              onChange={(e) =>
                setDraft((d) =>
                  d ? { ...d, pro_plan_price_try: Number.parseFloat(e.target.value) || 0 } : d,
                )
              }
              aria-invalid={draft.pro_plan_price_try <= 0 || undefined}
              disabled={patching}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pro_plan_billing_period">Dönem</Label>
            <Input
              id="pro_plan_billing_period"
              type="text"
              maxLength={32}
              value={draft.pro_plan_billing_period}
              onChange={(e) =>
                setDraft((d) => (d ? { ...d, pro_plan_billing_period: e.target.value } : d))
              }
              placeholder="6 ay"
              aria-invalid={!draft.pro_plan_billing_period.trim() || undefined}
              disabled={patching}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="shopier_checkout_url">Shopier ödeme linki</Label>
          <Input
            id="shopier_checkout_url"
            type="url"
            inputMode="url"
            value={draft.shopier_checkout_url}
            onChange={(e) => setDraft((d) => (d ? { ...d, shopier_checkout_url: e.target.value } : d))}
            placeholder="https://www.shopier.com/..."
            disabled={patching}
          />
        </div>

        <div className="rounded-lg border border-dashed bg-muted/40 px-4 py-3 text-sm">
          <span className="text-muted-foreground">Önizleme: </span>
          <span className="font-semibold text-foreground">{preview.priceLabelWithPeriod}</span>
        </div>
      </CardContent>
      <CardFooter className="flex-wrap gap-3 border-t pt-4">
        <Button
          type="button"
          onClick={() => void handleSave()}
          disabled={patching || invalid || !dirty}
        >
          {patching ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Save className="h-4 w-4" aria-hidden />
          )}
          Kaydet
        </Button>
        <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
          {saved ? (
            <span className="inline-flex items-center gap-1.5 text-primary">
              <Check className="h-4 w-4" aria-hidden />
              Kaydedildi. Bir sonraki sayfa yüklemesinde geçerli olur.
            </span>
          ) : dirty ? (
            'Kaydedilmemiş değişiklikler var.'
          ) : null}
        </p>
      </CardFooter>
    </Card>
  );
}
