'use client';

import { BookOpen } from 'lucide-react';
import { PageSectionCard } from '@/components/ui';
import {
  formatExamOptionLabel,
  settingsHelperClass,
  settingsLabelClass,
  settingsSelectClass,
} from '@/lib/settings/settingsFormStyles';
import type { SettingsPageState } from '@/components/settings/hooks/useSettingsPage';

type SettingsExamSectionProps = Pick<SettingsPageState, 'exams' | 'examId' | 'setExamId'>;

export function SettingsExamSection({ exams, examId, setExamId }: SettingsExamSectionProps) {
  return (
    <PageSectionCard title="Sınav / Ders" icon={<BookOpen className="h-6 w-6 text-primary-600 dark:text-primary-400" />}>
      <div>
        <label className={settingsLabelClass}>Aktif sınavınız</label>
        <select value={examId} onChange={(e) => setExamId(e.target.value)} className={settingsSelectClass}>
          <option value="">Sınav seçin</option>
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {formatExamOptionLabel(exam.name, exam.code)}
            </option>
          ))}
        </select>
        <p className={settingsHelperClass}>
          İlerleme ve konular bu sınava göre gösterilir. Değiştirdiğinizde yeni sınav aktif olur.
        </p>
      </div>
    </PageSectionCard>
  );
}
