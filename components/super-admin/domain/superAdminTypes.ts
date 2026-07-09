export const LANDING_SHOW_PARTNERS_KEY = 'landing_show_partners';
export const DENEME_SHOW_ADVANCED_KEY = 'deneme_show_advanced';

export interface AdminStats {
  usersCount: number;
  activeUsersCount: number;
  examsCount: number;
  pomodoroSessionsCount: number;
  examAssignmentsCount: number;
  shopierCheckoutClicks: number;
  planStats?: Array<{
    planId: string | null;
    planCode: string;
    planName: string;
    planType: string;
    userCount: number;
  }>;
}

export type PlanStat = NonNullable<AdminStats['planStats']>[number];

export interface AdminUser {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  role: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  exams: { id: string; name: string; code: string }[];
  hearAboutLabel?: string;
}

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  INSTITUTION_ADMIN: 'Kurum Admin',
  INDIVIDUAL: 'Bireysel',
  VIEWER: 'İzleyici',
};

export interface AdminAuditLog {
  id: string;
  action: string;
  resource: string | null;
  ipAddress: string | null;
  createdAt: string;
  actor: {
    id: string;
    email: string | null;
    name: string | null;
  };
}
