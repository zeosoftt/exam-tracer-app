'use client';

import { Bell } from 'lucide-react';
import { PageSectionCard } from '@/components/ui';
import { ToggleSwitch } from '@/components/settings/SettingsUi';
import type { SettingsPageState } from '@/components/settings/hooks/useSettingsPage';

type SettingsNotificationsSectionProps = Pick<
  SettingsPageState,
  'emailNotifications' | 'setEmailNotifications' | 'studyReminders' | 'setStudyReminders'
>;

export function SettingsNotificationsSection({
  emailNotifications,
  setEmailNotifications,
  studyReminders,
  setStudyReminders,
}: SettingsNotificationsSectionProps) {
  return (
    <PageSectionCard
      title="Bildirimler"
      icon={<Bell className="h-6 w-6 text-pink-600 dark:text-pink-400" />}
      iconClassName="bg-pink-100 dark:bg-pink-950/40"
      description="Değişiklikler Kaydet ile birlikte uygulanır."
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-stone-900 dark:text-stone-100">E-posta bildirimleri</div>
            <div className="text-sm text-stone-600 dark:text-stone-400">Önemli güncellemeler için e-posta alın</div>
          </div>
          <ToggleSwitch
            checked={emailNotifications}
            onChange={setEmailNotifications}
            aria-label="E-posta bildirimleri"
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-stone-900 dark:text-stone-100">Çalışma hatırlatıcıları</div>
            <div className="text-sm text-stone-600 dark:text-stone-400">Günlük hedefler için hatırlatıcılar</div>
          </div>
          <ToggleSwitch
            checked={studyReminders}
            onChange={setStudyReminders}
            aria-label="Çalışma hatırlatıcıları"
          />
        </div>
      </div>
    </PageSectionCard>
  );
}
