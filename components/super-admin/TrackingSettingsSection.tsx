'use client';

import { useEffect, useState } from 'react';
import { BarChart2, Check, Loader2, Save } from 'lucide-react';
import type { AdminSiteSettings } from '@/lib/siteSettings';
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
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AdminFormSkeleton } from '@/components/super-admin/layout/AdminLoading';

type TrackingDraft = Pick<
  AdminSiteSettings,
  | 'tracking_gtm_enabled'
  | 'tracking_ga_enabled'
  | 'tracking_adsense_enabled'
  | 'gtm_container_id'
  | 'ga_measurement_id'
  | 'adsense_client_id'
>;

const KEYS: (keyof TrackingDraft)[] = [
  'tracking_gtm_enabled',
  'tracking_ga_enabled',
  'tracking_adsense_enabled',
  'gtm_container_id',
  'ga_measurement_id',
  'adsense_client_id',
];

type Props = {
  settings: AdminSiteSettings | null;
  loading: boolean;
  patching: boolean;
  onSave: (patch: Partial<AdminSiteSettings>) => Promise<void>;
};

function pick(settings: AdminSiteSettings): TrackingDraft {
  return {
    tracking_gtm_enabled: settings.tracking_gtm_enabled,
    tracking_ga_enabled: settings.tracking_ga_enabled,
    tracking_adsense_enabled: settings.tracking_adsense_enabled,
    gtm_container_id: settings.gtm_container_id,
    ga_measurement_id: settings.ga_measurement_id,
    adsense_client_id: settings.adsense_client_id,
  };
}

function isDirty(draft: TrackingDraft, settings: AdminSiteSettings | null): boolean {
  if (!settings) return false;
  return KEYS.some((k) => draft[k] !== settings[k]);
}

export function TrackingSettingsSection({ settings, loading, patching, onSave }: Props) {
  const [draft, setDraft] = useState<TrackingDraft | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setDraft(pick(settings));
  }, [settings]);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2500);
    return () => clearTimeout(t);
  }, [saved]);

  const header = (
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-base">
        <BarChart2 className="h-4 w-4 text-primary" aria-hidden />
        İzleme & analytics
      </CardTitle>
      <CardDescription>
        Üçüncü taraf izleme kodları. Kapalı olan servislerin kimliği saklanır ama yüklenmez.
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

  const dirty = isDirty(draft, settings);

  const handleSave = async () => {
    setSaved(false);
    await onSave(draft);
    setSaved(true);
  };

  return (
    <Card>
      {header}
      <CardContent className="space-y-6">
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
      <CardFooter className="flex-wrap gap-3 border-t pt-4">
        <Button type="button" onClick={() => void handleSave()} disabled={patching || !dirty}>
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
  const switchId = `${inputId}-enabled`;
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Label htmlFor={switchId} className="cursor-pointer text-sm font-medium">
            {label}
          </Label>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
        <Switch
          id={switchId}
          checked={enabled}
          disabled={disabled}
          onCheckedChange={onToggle}
          aria-label={`${label} etkin`}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={inputId} className="sr-only">
          {label} kimliği
        </Label>
        <Input
          id={inputId}
          type="text"
          autoComplete="off"
          spellCheck={false}
          className="font-mono"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || !enabled}
        />
      </div>
    </div>
  );
}
