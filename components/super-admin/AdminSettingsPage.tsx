'use client';

import { Loader2, Tag, BarChart2 } from 'lucide-react';
import { useAdminSiteSettings } from '@/components/super-admin/hooks/useSuperAdminPanel';
import { PricingSettingsSection } from '@/components/super-admin/PricingSettingsSection';
import { TrackingSettingsSection } from '@/components/super-admin/TrackingSettingsSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function AdminSettingsPage() {
  const {
    siteSettings,
    siteSettingsLoading,
    siteSettingsPatching,
    siteSettingsLoadError,
    siteSettingsPatchError,
    patchSiteSettings,
  } = useAdminSiteSettings();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Ayarlar</h2>
        <p className="text-sm text-muted-foreground">Landing, deneme, fiyat ve izleme</p>
      </div>

      {siteSettingsLoadError ? (
        <Alert variant="destructive">
          <AlertDescription>{siteSettingsLoadError}</AlertDescription>
        </Alert>
      ) : null}
      {siteSettingsPatchError ? (
        <Alert variant="destructive">
          <AlertDescription>{siteSettingsPatchError}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ana Sayfa Bölümleri</CardTitle>
          <CardDescription>
            Ana sayfada hangi bölümlerin görüneceğini açıp kapatabilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {siteSettingsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Yükleniyor...</span>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">Birlikte Çalıştığımız Kurumlar</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {siteSettings?.landing_show_partners ?? true ? 'Gösteriliyor' : 'Gizli'}
                </p>
              </div>
              <Switch
                checked={siteSettings?.landing_show_partners ?? true}
                disabled={siteSettingsPatching}
                onCheckedChange={(checked) =>
                  void patchSiteSettings({ landing_show_partners: checked })
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Deneme Takibi Sayfası</CardTitle>
          <CardDescription>
            Kapalıyken sadece liste; açıkken analiz, form ve KPSS önizlemesi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {siteSettingsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Yükleniyor...</span>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">Gelişmiş deneme özellikleri</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {siteSettings?.deneme_show_advanced ?? true
                    ? 'Açık — tam arayüz'
                    : 'Kapalı — sadece liste'}
                </p>
              </div>
              <Switch
                checked={siteSettings?.deneme_show_advanced ?? true}
                disabled={siteSettingsPatching}
                onCheckedChange={(checked) =>
                  void patchSiteSettings({ deneme_show_advanced: checked })
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" aria-hidden />
          <h3 className="text-lg font-semibold">Pro Fiyatlandırma</h3>
        </div>
        <PricingSettingsSection
          settings={siteSettings}
          loading={siteSettingsLoading}
          patching={siteSettingsPatching}
          onSave={patchSiteSettings}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-primary" aria-hidden />
          <h3 className="text-lg font-semibold">İzleme & Analytics</h3>
        </div>
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
