'use client';

import { useId } from 'react';
import { useAdminSiteSettings } from '@/components/super-admin/hooks/useSuperAdminPanel';
import { PricingSettingsSection } from '@/components/super-admin/PricingSettingsSection';
import { TrackingSettingsSection } from '@/components/super-admin/TrackingSettingsSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { AdminPageHeader } from '@/components/super-admin/layout/AdminPageHeader';
import { AdminErrorAlert } from '@/components/super-admin/layout/AdminErrorAlert';
import { ADMIN_NAV_ITEMS } from '@/components/super-admin/layout/adminNav';

const nav = ADMIN_NAV_ITEMS.find((i) => i.href.endsWith('/settings'));

function ToggleRow({
  label,
  hint,
  checked,
  disabled,
  onCheckedChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  disabled: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="min-w-0">
        <Label htmlFor={id} className="cursor-pointer text-sm font-medium">
          {label}
        </Label>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch id={id} checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function ToggleRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 py-1" aria-hidden>
      <div className="space-y-2">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-6 w-11 rounded-full" />
    </div>
  );
}

export function AdminSettingsPage() {
  const {
    siteSettings,
    siteSettingsLoading,
    siteSettingsPatching,
    siteSettingsLoadError,
    siteSettingsPatchError,
    patchSiteSettings,
  } = useAdminSiteSettings();

  const showPartners = siteSettings?.landing_show_partners ?? true;
  const showAdvanced = siteSettings?.deneme_show_advanced ?? true;

  return (
    <div className="space-y-6">
      <AdminPageHeader title={nav?.title ?? 'Ayarlar'} description={nav?.description} />

      {siteSettingsLoadError ? <AdminErrorAlert message={siteSettingsLoadError} /> : null}
      {siteSettingsPatchError ? (
        <AdminErrorAlert title="Kaydedilemedi" message={siteSettingsPatchError} />
      ) : null}

      <div className="max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Görünürlük</CardTitle>
            <CardDescription>
              Ana sayfa ve deneme sayfasında hangi bölümlerin görüneceğini belirler. Değişiklik
              anında kaydedilir.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {siteSettingsLoading ? (
              <div className="space-y-4" role="status" aria-busy="true" aria-label="Yükleniyor">
                <ToggleRowSkeleton />
                <Separator />
                <ToggleRowSkeleton />
              </div>
            ) : (
              <div className="space-y-4">
                <ToggleRow
                  label="Birlikte Çalıştığımız Kurumlar"
                  hint={
                    showPartners
                      ? 'Ana sayfada gösteriliyor'
                      : 'Ana sayfada gizli'
                  }
                  checked={showPartners}
                  disabled={siteSettingsPatching}
                  onCheckedChange={(checked) =>
                    void patchSiteSettings({ landing_show_partners: checked })
                  }
                />
                <Separator />
                <ToggleRow
                  label="Gelişmiş deneme özellikleri"
                  hint={
                    showAdvanced
                      ? 'Açık: analiz, form ve KPSS önizlemesi görünür'
                      : 'Kapalı: deneme sayfasında sadece liste'
                  }
                  checked={showAdvanced}
                  disabled={siteSettingsPatching}
                  onCheckedChange={(checked) =>
                    void patchSiteSettings({ deneme_show_advanced: checked })
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>

        <PricingSettingsSection
          settings={siteSettings}
          loading={siteSettingsLoading}
          patching={siteSettingsPatching}
          onSave={patchSiteSettings}
        />

        <TrackingSettingsSection
          settings={siteSettings}
          loading={siteSettingsLoading}
          patching={siteSettingsPatching}
          onSave={patchSiteSettings}
        />
      </div>
    </div>
  );
}
