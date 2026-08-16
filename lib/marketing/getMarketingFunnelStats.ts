import { prisma } from '@/lib/db/prisma';
import { getPublicPricingConfig } from '@/lib/siteSettings';
import {
  extractCheckoutByTouchpoint,
  getMarketingEventCounts,
  getPurchaseCount,
} from '@/lib/marketing/marketingMetricsStore';
import { getShopierCheckoutClickCount } from '@/lib/siteSettings';
import { MARKETING_TOUCHPOINT_LABELS, type MarketingTouchpoint } from '@/lib/marketing/touchpoints';
import { getSessionEngagementStats } from '@/lib/marketing/getSessionEngagementStats';
import type { SessionEngagementStats } from '@/lib/marketing/sessionEngagementTypes';

export type MarketingFunnelStats = {
  eventCounts: Record<string, number>;
  shopierCheckoutClicks: number;
  purchasesTotal: number;
  estimatedRevenueTry: number;
  checkoutByTouchpoint: Array<{ touchpoint: string; label: string; count: number }>;
  signupsLast7Days: number;
  signupsLast30Days: number;
  setupWizardCompleted: number;
  verifiedUsers: number;
  proUsers: number;
  freeUsers: number;
  conversionRatePct: number;
  checkoutToPurchaseRatePct: number | null;
  acquisitionSources: Array<{ source: string; count: number }>;
  engagement: SessionEngagementStats;
};

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

export async function getMarketingFunnelStats(): Promise<MarketingFunnelStats> {
  const since7 = daysAgo(7);
  const since30 = daysAgo(30);

  const [
    eventCounts,
    purchasesTotal,
    shopierLegacy,
    signupsLast7Days,
    signupsLast30Days,
    setupWizardCompleted,
    verifiedUsers,
    planGroups,
    acquisitionGroups,
    engagement,
  ] = await Promise.all([
    getMarketingEventCounts(),
    getPurchaseCount(),
    getShopierCheckoutClickCount(),
    prisma.user.count({ where: { deletedAt: null, createdAt: { gte: since7 } } }),
    prisma.user.count({ where: { deletedAt: null, createdAt: { gte: since30 } } }),
    prisma.user.count({ where: { deletedAt: null, setupWizardCompletedAt: { not: null } } }),
    prisma.user.count({ where: { deletedAt: null, emailVerified: true } }),
    prisma.organization.groupBy({
      by: ['currentPlanId'],
      where: { deletedAt: null, isPersonal: true },
      _count: { _all: true },
    }),
    prisma.user.groupBy({
      by: ['acquisitionSource'],
      where: { deletedAt: null, acquisitionSource: { not: null } },
      _count: { _all: true },
    }),
    getSessionEngagementStats(),
  ]);

  const planIds = planGroups.map((g) => g.currentPlanId).filter(Boolean) as string[];
  const plans = planIds.length
    ? await prisma.plan.findMany({ where: { id: { in: planIds } }, select: { id: true, code: true } })
    : [];
  const planCodeById = new Map(plans.map((p) => [p.id, p.code]));

  let proUsers = 0;
  let freeUsers = 0;
  for (const g of planGroups) {
    const code = g.currentPlanId ? planCodeById.get(g.currentPlanId) : null;
    if (code === 'PRO' || code === 'ENTERPRISE') proUsers += g._count._all;
    else if (code === 'FREE') freeUsers += g._count._all;
  }

  const totalAssigned = proUsers + freeUsers;
  const conversionRatePct = totalAssigned > 0 ? Math.round((proUsers / totalAssigned) * 1000) / 10 : 0;

  const shopierCheckoutClicks = Math.max(
    shopierLegacy,
    eventCounts.begin_checkout ?? 0,
  );

  const checkoutToPurchaseRatePct =
    shopierCheckoutClicks > 0
      ? Math.round((purchasesTotal / shopierCheckoutClicks) * 1000) / 10
      : null;

  const checkoutRaw = extractCheckoutByTouchpoint(eventCounts);
  const pricing = await getPublicPricingConfig();

  return {
    eventCounts,
    shopierCheckoutClicks,
    purchasesTotal,
    estimatedRevenueTry: Math.round(purchasesTotal * pricing.priceTry * 100) / 100,
    checkoutByTouchpoint: checkoutRaw.map(({ touchpoint, count }) => ({
      touchpoint,
      label:
        MARKETING_TOUCHPOINT_LABELS[touchpoint as MarketingTouchpoint] ?? touchpoint,
      count,
    })),
    signupsLast7Days,
    signupsLast30Days,
    setupWizardCompleted,
    verifiedUsers,
    proUsers,
    freeUsers,
    conversionRatePct,
    checkoutToPurchaseRatePct,
    acquisitionSources: acquisitionGroups
      .map((g) => ({
        source: g.acquisitionSource ?? 'UNKNOWN',
        count: g._count._all,
      }))
      .sort((a, b) => b.count - a.count),
    engagement,
  };
}
