/**
 * Dashboard istatistik verisi — HTTP/cache route dışında (SRP).
 * @deprecated Doğrudan `@/lib/services/dashboard/stats/*` import et.
 */

export type {
  DashboardStatsBuildInput,
  PrismaWithExamAttempt,
} from '@/lib/services/dashboard/stats/types';

export { buildDashboardStatsData } from '@/lib/services/dashboard/stats/buildDashboardStatsData';
