'use client';

import { Palette } from 'lucide-react';
import { PageSectionCard } from '@/components/ui';
import { ThemeSelect } from '@/components/theme/ThemeSelect';

export function SettingsAppearanceSection() {
  return (
    <PageSectionCard
      title="Görünüm"
      icon={<Palette className="h-6 w-6 text-stone-600 dark:text-stone-300" />}
      iconClassName="bg-stone-100 dark:bg-stone-800"
      description="Tercih bu cihazda saklanır; ister buradan ister üst menüdeki ikonlardan değiştirin."
    >
      <ThemeSelect />
    </PageSectionCard>
  );
}
