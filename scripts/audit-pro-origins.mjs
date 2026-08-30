/**
 * READ-ONLY: PRO user origin audit. Does not mutate data.
 */
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';

function loadEnvFile(fileName) {
  const p = resolve(process.cwd(), fileName);
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i <= 0) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const prisma = new PrismaClient();

function classifySubscription(sub) {
  if (!sub) return { category: 'UNKNOWN', reason: 'no_subscription_row' };
  const meta = sub.metadata && typeof sub.metadata === 'object' ? sub.metadata : {};
  const provider = typeof meta.provider === 'string' ? meta.provider : null;
  const externalOrderId =
    typeof meta.externalOrderId === 'string' ? meta.externalOrderId : null;
  if (provider === 'shopier' && externalOrderId) {
    return { category: 'SHOPIER_WEBHOOK', reason: 'metadata.provider=shopier + externalOrderId' };
  }
  if (provider === 'shopier') {
    return { category: 'SHOPIER_WEBHOOK', reason: 'metadata.provider=shopier (no order id)' };
  }
  if (provider === 'manual' || provider === 'admin') {
    return { category: String(provider).toUpperCase(), reason: `metadata.provider=${provider}` };
  }
  if (provider === 'seed') {
    return { category: 'SEED', reason: 'metadata.provider=seed' };
  }
  if (externalOrderId && !provider) {
    return { category: 'UNKNOWN', reason: 'externalOrderId without provider' };
  }
  if (Object.keys(meta).length === 0) {
    return { category: 'UNKNOWN', reason: 'subscription exists but empty metadata' };
  }
  return { category: 'UNKNOWN', reason: `metadata=${JSON.stringify(meta)}` };
}

async function main() {
  const secretConfigured = Boolean(process.env.SHOPIER_WEBHOOK_SECRET?.trim());
  console.log(JSON.stringify({ SHOPIER_WEBHOOK_SECRET_configured: secretConfigured }, null, 2));

  const proPlans = await prisma.plan.findMany({
    where: { code: { in: ['PRO', 'ENTERPRISE'] } },
    select: { id: true, code: true, name: true, price: true },
  });
  console.log('PLANS', JSON.stringify(proPlans));

  const planIds = proPlans.map((p) => p.id);
  if (planIds.length === 0) {
    console.log('No PRO/ENTERPRISE plans found');
    return;
  }

  const orgs = await prisma.organization.findMany({
    where: { deletedAt: null, isPersonal: true, currentPlanId: { in: planIds } },
    select: {
      id: true,
      name: true,
      currentPlanId: true,
      subscriptionId: true,
      createdAt: true,
      updatedAt: true,
      subscriptions: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          planId: true,
          status: true,
          price: true,
          currency: true,
          currentPeriodStart: true,
          currentPeriodEnd: true,
          metadata: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  const users = await prisma.user.findMany({
    where: { deletedAt: null, personalOrganizationId: { in: orgs.map((o) => o.id) } },
    select: {
      id: true,
      email: true,
      personalOrganizationId: true,
      createdAt: true,
      role: true,
    },
  });

  const results = [];
  for (const org of orgs) {
    const user = users.find((u) => u.personalOrganizationId === org.id);
    const plan = proPlans.find((p) => p.id === org.currentPlanId);
    const primarySub =
      org.subscriptions.find((s) => s.id === org.subscriptionId) ?? org.subscriptions[0] ?? null;
    const classification = classifySubscription(primarySub);
    results.push({
      userId: user?.id ?? null,
      email: user?.email ?? null,
      userCreatedAt: user?.createdAt ?? null,
      role: user?.role ?? null,
      orgId: org.id,
      orgUpdatedAt: org.updatedAt,
      planCode: plan?.code ?? null,
      currentPlanId: org.currentPlanId,
      organizationSubscriptionId: org.subscriptionId,
      subscriptionCount: org.subscriptions.length,
      primarySubscription: primarySub
        ? {
            id: primarySub.id,
            status: primarySub.status,
            price: primarySub.price,
            currency: primarySub.currency,
            currentPeriodStart: primarySub.currentPeriodStart,
            currentPeriodEnd: primarySub.currentPeriodEnd,
            metadata: primarySub.metadata,
            createdAt: primarySub.createdAt,
            updatedAt: primarySub.updatedAt,
          }
        : null,
      allSubscriptionMetadata: org.subscriptions.map((s) => ({
        id: s.id,
        status: s.status,
        metadata: s.metadata,
        createdAt: s.createdAt,
      })),
      origin: classification.category,
      originEvidence: classification.reason,
    });
  }

  console.log('PRO_COUNT', results.length);
  console.log(JSON.stringify(results, null, 2));

  const summary = results.reduce((acc, r) => {
    acc[r.origin] = (acc[r.origin] ?? 0) + 1;
    return acc;
  }, {});
  console.log('ORIGIN_SUMMARY', JSON.stringify(summary));
}

main()
  .catch((e) => {
    console.error('ERR', e.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
