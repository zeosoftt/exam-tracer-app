/** Ayarlar sayfası — paylaşılan tipler (UI / hook / API parse). */

export type SettingsExamOption = {
  id: string;
  name: string;
  code: string;
};

export type SettingsData = {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    name: string;
    targetScore: number | null;
    dailyStudyHours: number | null;
    emailNotifications?: boolean;
    studyReminders?: boolean;
  };
  activeExam: { id: string; name: string; code: string } | null;
};

export type PlanInfo = {
  planCode: string;
  planName: string;
  planType: string;
  subscriptionStatus: string;
  limits: Array<{ resourceType: string; current: number; limit: number; allowed: boolean }>;
  features: string[];
  expiresAt: string | null;
};

export type SettingsFlashMessage = {
  type: 'success' | 'error';
  text: string;
};
