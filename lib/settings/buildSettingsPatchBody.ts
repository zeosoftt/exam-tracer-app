/** Ayarlar PATCH gövdesi — form alanlarından API yükü (iş kuralı). */

export type SettingsFormFields = {
  firstName: string;
  lastName: string;
  examId: string;
  targetScore: string;
  dailyStudyHours: string;
  emailNotifications: boolean;
  studyReminders: boolean;
};

export function buildSettingsPatchBody(fields: SettingsFormFields): Record<string, unknown> {
  const body: Record<string, unknown> = {
    firstName: fields.firstName.trim() || undefined,
    lastName: fields.lastName.trim() || undefined,
    examId: fields.examId === '' ? '' : fields.examId || undefined,
    emailNotifications: fields.emailNotifications,
    studyReminders: fields.studyReminders,
  };

  const ts = fields.targetScore.trim();
  const dh = fields.dailyStudyHours.trim();
  body.targetScore = ts !== '' ? parseInt(ts, 10) : null;
  body.dailyStudyHours = dh !== '' ? parseInt(dh, 10) : null;

  return body;
}
