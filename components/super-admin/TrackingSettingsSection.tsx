'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import type { AdminSiteSettings } from '@/lib/siteSettings';

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
      <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
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
    <div className="max-w-2xl space-y-5 rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/90">
      <TrackingRow
        label="Google Tag Manager"
        hint="GTM konteyner kimliği (ör. GTM-T39WM29L). Head ve body snippet otomatik eklenir."
        enabled={draft.tracking_gtm_enabled}
        onToggle={() => setDraft((d) => d && { ...d, tracking_gtm_enabled: !d.tracking_gtm_enabled })}
        inputId="gtm_container_id"
        inputValue={draft.gtm_container_id}
        onInputChange={(v) => setDraft((d) => d && { ...d, gtm_container_id: v })}
        placeholder="GTM-XXXXXXX"
        disabled={patching}
      />
      <TrackingRow
        label="Google Analytics (GA4)"
        hint="Ölçüm kimliği (ör. G-XXXXXXXX). gtag.js ile yüklenir."
        enabled={draft.tracking_ga_enabled}
        onToggle={() => setDraft((d) => d && { ...d, tracking_ga_enabled: !d.tracking_ga_enabled })}
        inputId="ga_measurement_id"
        inputValue={draft.ga_measurement_id}
        onInputChange={(v) => setDraft((d) => d && { ...d, ga_measurement_id: v })}
        placeholder="G-XXXXXXXX"
        disabled={patching}
      />
      <TrackingRow
        label="Google AdSense"
        hint="Yayıncı kimliği (ör. ca-pub-XXXXXXXX). Meta doğrulama + script eklenir."
        enabled={draft.tracking_adsense_enabled}
        onToggle={() => setDraft((d) => d && { ...d, tracking_adsense_enabled: !d.tracking_adsense_enabled })}
        inputId="adsense_client_id"
        inputValue={draft.adsense_client_id}
        onInputChange={(v) => setDraft((d) => d && { ...d, adsense_client_id: v })}
        placeholder="ca-pub-XXXXXXXX"
        disabled={patching}
      />
      <div className="flex items-center gap-3 border-t border-stone-100 pt-4 dark:border-stone-800">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={patching}
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
  onToggle: () => void;
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
          <p className="font-medium text-stone-900 dark:text-stone-100">{label}</p>
          <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{hint}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          disabled={disabled}
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-stone-950 ${
            enabled ? 'bg-primary-600' : 'bg-stone-200 dark:bg-stone-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition dark:bg-stone-200 ${
              enabled ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      <input
        id={inputId}
        type="text"
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled || !enabled}
        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
      />
    </div>
  );
}
