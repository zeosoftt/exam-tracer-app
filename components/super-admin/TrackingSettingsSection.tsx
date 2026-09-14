'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import type { AdminSiteSettings } from '@/lib/siteSettings';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type TrackingDraft = Pick<
  AdminSiteSettings,
  | 'tracking_gtm_enabled'
  | 'tracking_ga_enabled'
  | 'tracking_adsense_enabled'
  | 'gtm_container_id'
  | 'ga_measurement_id'
  | 'adsense_client_id'
>;

type Props = {
  settings: AdminSiteSettings | null;
  loading: boolean;
  patching: boolean;
  onSave: (patch: Partial<AdminSiteSettings>) => Promise<void>;
};

export function TrackingSettingsSection({ settings, loading, patching, onSave }: Props) {
  const [draft, setDraft] = useState<TrackingDraft | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setDraft({
      tracking_gtm_enabled: settings.tracking_gtm_enabled,
      tracking_ga_enabled: settings.tracking_ga_enabled,
      tracking_adsense_enabled: settings.tracking_adsense_enabled,
      gtm_container_id: settings.gtm_container_id,
      ga_measurement_id: settings.ga_measurement_id,
      adsense_client_id: settings.adsense_client_id,
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

  const handleSave = async () => {
    setSaved(false);
    await onSave(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <Card className="max-w-2xl">
      <CardContent className="space-y-6 pt-6">
        <TrackingRow
          label="Google Tag Manager"
          hint="GTM konteyner kimliği (ör. GTM-T39WM29L). Head ve body snippet otomatik eklenir."
          enabled={draft.tracking_gtm_enabled}
          onToggle={(v) => setDraft((d) => d && { ...d, tracking_gtm_enabled: v })}
          inputId="gtm_container_id"
          inputValue={draft.gtm_container_id}
          onInputChange={(v) => setDraft((d) => d && { ...d, gtm_container_id: v })}
          placeholder="GTM-XXXXXXX"
          disabled={patching}
        />
        <Separator />
        <TrackingRow
          label="Google Analytics (GA4)"
          hint="Ölçüm kimliği (ör. G-XXXXXXXX). gtag.js ile yüklenir."
          enabled={draft.tracking_ga_enabled}
          onToggle={(v) => setDraft((d) => d && { ...d, tracking_ga_enabled: v })}
          inputId="ga_measurement_id"
          inputValue={draft.ga_measurement_id}
          onInputChange={(v) => setDraft((d) => d && { ...d, ga_measurement_id: v })}
          placeholder="G-XXXXXXXX"
          disabled={patching}
        />
        <Separator />
        <TrackingRow
          label="Google AdSense"
          hint="Yayıncı kimliği (ör. ca-pub-XXXXXXXX). Meta doğrulama + script eklenir."
          enabled={draft.tracking_adsense_enabled}
          onToggle={(v) => setDraft((d) => d && { ...d, tracking_adsense_enabled: v })}
          inputId="adsense_client_id"
          inputValue={draft.adsense_client_id}
          onInputChange={(v) => setDraft((d) => d && { ...d, adsense_client_id: v })}
          placeholder="ca-pub-XXXXXXXX"
          disabled={patching}
        />
      </CardContent>
      <CardFooter className="gap-3 border-t pt-4">
        <Button type="button" onClick={() => void handleSave()} disabled={patching}>
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

function TrackingRow({
  label,
  hint,
  enabled,
  onToggle,
  inputId,
  inputValue,
  onInputChange,
  placeholder,
  disabled,
}: {
  label: string;
  hint: string;
  enabled: boolean;
  onToggle: (value: boolean) => void;
  inputId: string;
  inputValue: string;
  onInputChange: (value: string) => void;
  placeholder: string;
  disabled: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Label htmlFor={inputId} className="text-base">
            {label}
          </Label>
          <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        </div>
        <Switch checked={enabled} disabled={disabled} onCheckedChange={onToggle} />
      </div>
      <Input
        id={inputId}
        type="text"
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled || !enabled}
      />
    </div>
  );
}
