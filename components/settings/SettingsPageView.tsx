'use client';

import { SubAppPageHeader, FlashMessage } from '@/components/ui';
import { pageIntroClass } from '@/lib/ui/pageStyles';
import type { SettingsPageState } from '@/components/settings/hooks/useSettingsPage';
import { SettingsSupportBanner } from '@/components/settings/sections/SettingsSupportBanner';
import { SettingsAccountSection } from '@/components/settings/sections/SettingsAccountSection';
import { SettingsPlanSection } from '@/components/settings/sections/SettingsPlanSection';
import { SettingsGoalsSection } from '@/components/settings/sections/SettingsGoalsSection';
import { SettingsExamSection } from '@/components/settings/sections/SettingsExamSection';
import { SettingsNotificationsSection } from '@/components/settings/sections/SettingsNotificationsSection';
import { SettingsAppearanceSection } from '@/components/settings/sections/SettingsAppearanceSection';
import { SettingsDeleteAccountSection } from '@/components/settings/sections/SettingsDeleteAccountSection';
import { SettingsEmailChangeSection } from '@/components/settings/sections/SettingsEmailChangeSection';
import { SettingsSaveBar } from '@/components/settings/sections/SettingsSaveBar';
import { AppVersionLabel } from '@/components/layout/AppVersionLabel';

type SettingsPageViewProps = {
  page: SettingsPageState;
};

export function SettingsPageView({ page }: SettingsPageViewProps) {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <SubAppPageHeader title="Ayarlar" showThemeToggle={false} />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <p className={pageIntroClass}>Hesap, görünüm, hedef ve sınav tercihleri</p>

        <SettingsSupportBanner />

        {page.message ? <FlashMessage type={page.message.type}>{page.message.text}</FlashMessage> : null}

        <div className="space-y-6">
          <SettingsAccountSection {...page} />
          <SettingsEmailChangeSection />
          <SettingsPlanSection planInfo={page.planInfo} planLoading={page.planLoading} />
          <SettingsGoalsSection
            targetScore={page.targetScore}
            setTargetScore={page.setTargetScore}
            dailyStudyHours={page.dailyStudyHours}
            setDailyStudyHours={page.setDailyStudyHours}
          />
          <SettingsExamSection exams={page.exams} examId={page.examId} setExamId={page.setExamId} />
          <SettingsNotificationsSection
            emailNotifications={page.emailNotifications}
            setEmailNotifications={page.setEmailNotifications}
            studyReminders={page.studyReminders}
            setStudyReminders={page.setStudyReminders}
          />
          <SettingsAppearanceSection />
          <SettingsDeleteAccountSection />
          <SettingsSaveBar saving={page.saving} handleSaveSettings={page.handleSaveSettings} />
        </div>

        <div className="mt-10 flex justify-center border-t border-stone-200 pt-6 dark:border-stone-800">
          <AppVersionLabel />
        </div>
      </main>
    </div>
  );
}
