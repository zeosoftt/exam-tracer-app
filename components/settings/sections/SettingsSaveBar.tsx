'use client';

import { Loader2, Save } from 'lucide-react';
import type { SettingsPageState } from '@/components/settings/hooks/useSettingsPage';

type SettingsSaveBarProps = Pick<SettingsPageState, 'saving' | 'handleSaveSettings'>;

export function SettingsSaveBar({ saving, handleSaveSettings }: SettingsSaveBarProps) {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={handleSaveSettings}
        disabled={saving}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 px-8 py-4 font-bold text-white transition-all hover:shadow-xl disabled:opacity-70"
      >
        {saving ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Save className="h-5 w-5" aria-hidden />}
        Değişiklikleri kaydet
      </button>
    </div>
  );
}
