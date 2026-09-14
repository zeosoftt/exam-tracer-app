'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import type { AdminSiteSettings } from '@/lib/siteSettings';
import { buildProPlanPriceLabels } from '@/lib/marketing/pricingDisplay';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
      <div className="flex items-center gap-2 text-muted-foreground">
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
    <Card className="max-w-2xl">
      <CardContent className="space-y-5 pt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pro_plan_price_try">Pro fiyat (₺)</Label>
            <Input
              id="pro_plan_price_try"
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
              disabled={patching}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="shopier_checkout_url">Shopier ödeme linki</Label>
          <Input
            id="shopier_checkout_url"
            type="url"
            value={draft.shopier_checkout_url}
            onChange={(e) => setDraft((d) => (d ? { ...d, shopier_checkout_url: e.target.value } : d))}
            placeholder="https://www.shopier.com/..."
            disabled={patching}
          />
          <p className="text-xs text-muted-foreground">
            Landing, dashboard ve deneme sayfalarındaki &quot;Satın al&quot; butonları bu URL&apos;yi kullanır.
          </p>
        </div>

        <Alert>
          <AlertDescription className="font-medium text-primary">
            Önizleme: {preview.priceLabelWithPeriod}
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="gap-3 border-t pt-4">
        <Button
          type="button"
          onClick={() => void handleSave()}
          disabled={patching || draft.pro_plan_price_try <= 0 || !draft.pro_plan_billing_period.trim()}
        >
          {patching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Kaydet
        </Button>
        {saved ? (
          <span className="text-sm text-primary">
            Kaydedildi — bir sonraki sayfa yüklemesinde geçerli olur.
          </span>
        ) : null}
      </CardFooter>
    </Card>
  );
}
