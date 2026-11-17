/**
 * Dashboard ana sayfa — sunucu tarafı ilk veri (LCP / TTI).
 *
 * Eski akış: HTML → client chunk → /api/dashboard/stats (core) → /api/billing/plan → idle'da stats (full).
 * Yeni akış: aynı istatistikler RSC içinde tek seferde hesaplanır; istemci yalnızca odak/görünürlük
 * değişiminde tazeler.
 */

import { prisma } from '@/lib/db/prisma';
import { buildDashboardStatsData } from '@/lib/services/dashboard/stats/buildDashboardStatsData';
import { getActiveOrganizationId } from '@/lib/auth/authorization';
import { getOrganizationPlanSummary } from '@/lib/auth/planLimits';
import { logError } from '@/lib/logger';
import type { AuthenticatedSession } from '@/lib/auth/requireSession';
import type {
  DashboardHomeInitialData,
  DashboardStats,
} from '@/components/dashboard/domain/dashboardTypes';

async function loadPlanCode(session: AuthenticatedSession): Promise<string | null> {
  const organizationId =
    session.user.activeOrganizationId ?? (await getActiveOrganizationId(session.user.id));
  if (!organizationId) return null;
  const summary = await getOrganizationPlanSummary(organizationId);
  return summary?.planCode ?? null;
}

export async function loadDashboardHomeData(
  session: AuthenticatedSession,
): Promise<DashboardHomeInitialData> {
  const userId = session.user.id;

  const [statsRaw, planCode] = await Promise.all([
    buildDashboardStatsData(prisma, {
      userId,
      userRole: session.user.role,
      institutionId: session.user.institutionId,
      isCoreScope: false,
    }).catch((error: unknown) => {
      logError('Dashboard initial stats failed (client will retry)', error, { userId });
      return null;
    }),
    loadPlanCode(session).catch((error: unknown) => {
      logError('Dashboard initial plan code failed (client will retry)', error, { userId });
      return null;
    }),
  ]);

  // API ile birebir aynı şekil (Date → ISO string); istemci tipi JSON yanıtına göre yazılmış.
  const stats = statsRaw ? (JSON.parse(JSON.stringify(statsRaw)) as DashboardStats) : null;

  return { stats, planCode };
}
