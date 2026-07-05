/**
 * Super Admin Stats API
 * GET /api/super-admin/stats
 */

import { NextResponse } from 'next/server';
import { withAdminHandler } from '@/lib/api/withAdminHandler';
import { prisma } from '@/lib/db/prisma';
import { getShopierCheckoutClickCount } from '@/lib/siteSettings';

async function getStatsHandler(): Promise<NextResponse> {
  const [
    usersCount,
    activeUsersCount,
    examsCount,
    pomodoroSessionsCount,
    examAssignmentsCount,
    usersByPlan,
    shopierCheckoutClicks,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null, isActive: true } }),
    prisma.exam.count({ where: { deletedAt: null } }),
    prisma.pomodoroSession.count({ where: { deletedAt: null } }),
    prisma.examAssignment.count({ where: { deletedAt: null } }),
    prisma.user.groupBy({
      by: ['currentPlanId'],
      where: { deletedAt: null },
      _count: { _all: true },
    }),
    getShopierCheckoutClickCount(),
  ]);

  const planIds = usersByPlan
    .map((g) => g.currentPlanId)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);

  const plans = planIds.length
    ? await prisma.plan.findMany({
        where: { id: { in: planIds } },
        select: { id: true, code: true, name: true, type: true },
      })
    : [];

  const planById = new Map(plans.map((p) => [p.id, p]));

  const planStats = usersByPlan.map((g) => {
    if (!g.currentPlanId) {
      return {
        planId: null as string | null,
        planCode: 'UNASSIGNED',
        planName: 'Plan atanmamış',
        planType: 'UNKNOWN',
        userCount: g._count._all,
      };
    }
    const p = planById.get(g.currentPlanId);
    return {
      planId: g.currentPlanId,
      planCode: p?.code ?? 'UNKNOWN',
      planName: p?.name ?? 'Bilinmeyen plan',
      planType: p?.type ?? 'UNKNOWN',
      userCount: g._count._all,
    };
  });

  return NextResponse.json({
    success: true,
    data: {
      usersCount,
      activeUsersCount,
      examsCount,
      pomodoroSessionsCount,
      examAssignmentsCount,
      shopierCheckoutClicks,
      planStats,
    },
  });
}

export const GET = withAdminHandler(getStatsHandler);
