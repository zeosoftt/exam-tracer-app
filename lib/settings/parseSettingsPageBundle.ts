import type { fetchSettingsPageBundle } from '@/lib/client-api/userSettings';
import type { AvailableExam } from '@/lib/client-api/examsAvailable';
import type { PlanInfo, SettingsData, SettingsExamOption } from '@/lib/settings/settingsTypes';

type SettingsBundle = Awaited<ReturnType<typeof fetchSettingsPageBundle>>;

export function parseSettingsPageBundle(bundle: SettingsBundle): {
  settings: SettingsData | null;
  exams: SettingsExamOption[];
  planInfo: PlanInfo | null;
} {
  let settings: SettingsData | null = null;
  let planInfo: PlanInfo | null = null;

  if (bundle.settings.ok) {
    const data = bundle.settings.body as { success?: boolean; data?: SettingsData };
    if (data.success && data.data) {
      settings = data.data;
    }
  }

  const exams: SettingsExamOption[] =
    bundle.exams.length > 0
      ? bundle.exams.map((e: AvailableExam) => ({ id: e.id, name: e.name, code: e.code }))
      : [];

  if (bundle.plan.ok) {
    const planData = bundle.plan.body as { success?: boolean; data?: PlanInfo };
    if (planData.success && planData.data) {
      planInfo = planData.data;
    }
  }

  return { settings, exams, planInfo };
}

export function applySettingsDataToFormFields(data: SettingsData) {
  return {
    firstName: data.user?.firstName ?? '',
    lastName: data.user?.lastName ?? '',
    targetScore: data.user?.targetScore != null ? String(data.user.targetScore) : '',
    dailyStudyHours: data.user?.dailyStudyHours != null ? String(data.user.dailyStudyHours) : '',
    examId: data.activeExam?.id ?? '',
    emailNotifications: data.user?.emailNotifications ?? true,
    studyReminders: data.user?.studyReminders ?? true,
  };
}
