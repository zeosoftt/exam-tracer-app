'use client';

import { Target } from 'lucide-react';
import { PageSectionCard } from '@/components/ui';
import { settingsFieldClass, settingsLabelClass } from '@/lib/settings/settingsFormStyles';
import type { SettingsPageState } from '@/components/settings/hooks/useSettingsPage';

type SettingsGoalsSectionProps = Pick<
  SettingsPageState,
  'targetScore' | 'setTargetScore' | 'dailyStudyHours' | 'setDailyStudyHours'
>;

export function SettingsGoalsSection({
  targetScore,
  setTargetScore,
  dailyStudyHours,
  setDailyStudyHours,
}: SettingsGoalsSectionProps) {
  return (
    <PageSectionCard
      title="Çalışma Hedefleri"
      icon={<Target className="h-6 w-6 text-amber-600 dark:text-amber-400" />}
      iconClassName="bg-amber-100 dark:bg-amber-950/40"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={settingsLabelClass}>Hedef puan (0–100)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={targetScore}
            onChange={(e) => setTargetScore(e.target.value)}
            className={settingsFieldClass}
            placeholder="Örn. 96"
          />
        </div>
        <div>
          <label className={settingsLabelClass}>Günlük çalışma saati (0–24)</label>
          <input
            type="number"
            min={0}
            max={24}
            value={dailyStudyHours}
            onChange={(e) => setDailyStudyHours(e.target.value)}
            className={settingsFieldClass}
            placeholder="Örn. 4"
          />
        </div>
      </div>
    </PageSectionCard>
  );
}
