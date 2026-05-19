/**
 * Ayarlar — ince orchestrator (SoC: state hook + sunum bileşenleri).
 */

'use client';

import { useSettingsPage } from '@/components/settings/hooks/useSettingsPage';
import { SettingsPageLoading } from '@/components/settings/SettingsPageLoading';
import { SettingsPageView } from '@/components/settings/SettingsPageView';

export default function SettingsPage() {
  const page = useSettingsPage();

  if (page.loading) {
    return <SettingsPageLoading />;
  }

  return <SettingsPageView page={page} />;
}
