/**
 * DB'de bir kullanıcının planını değiştirir (Organization.currentPlanId).
 *
 * Kullanım:
 *   npx tsx scripts/change-user-plan.ts <email veya userId> <planKodu>
 *
 * Örnek:
 *   npx tsx scripts/change-user-plan.ts kullanici@mail.com PRO
 *   npx tsx scripts/change-user-plan.ts clxxx123abc FREE
 *
 * Plan kodları: plans tablosundaki code (örn. FREE, PRO, ENTERPRISE)
 */

import { prisma } from '../lib/db/prisma';

async function main() {
  const userArg = process.argv[2];
  const planCode = process.argv[3]?.toUpperCase();

  if (!userArg || !planCode) {
    console.error('Kullanım: npx tsx scripts/change-user-plan.ts <email veya userId> <planKodu>');
    console.error('Örnek:   npx tsx scripts/change-user-plan.ts kullanici@mail.com PRO');
    process.exit(1);
  }

  const plan = await prisma.plan.findFirst({
    where: { code: planCode, isActive: true },
    select: { id: true, code: true, name: true },
  });

  if (!plan) {
    console.error(`Plan bulunamadı: "${planCode}". Aktif plan kodlarını kontrol edin.`);
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      select: { code: true, name: true },
    });
    console.error('Mevcut planlar:', plans.map((p) => `${p.code} (${p.name})`).join(', '));
    process.exit(1);
  }

  const isEmail = userArg.includes('@');
  const user = await prisma.user.findFirst({
    where: isEmail
      ? { email: userArg.trim(), deletedAt: null }
      : { id: userArg.trim(), deletedAt: null },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      personalOrganizationId: true,
    },
  });

  if (!user?.personalOrganizationId) {
    console.error('Kullanıcı bulunamadı:', userArg);
    process.exit(1);
  }

  await prisma.organization.update({
    where: { id: user.personalOrganizationId },
    data: { currentPlanId: plan.id },
  });

  console.log('Plan güncellendi.');
  console.log('  Kullanıcı:', user.email, `(${user.firstName} ${user.lastName})`);
  console.log('  Yeni plan:', plan.code, '-', plan.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
