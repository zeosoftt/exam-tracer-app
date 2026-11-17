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
 *
 * Not: lib/db/prisma.ts `server-only` içerdiği için CLI'da doğrudan PrismaClient kullanılır.
 * Not: Plan özeti (hasFeatureAccess / plan rozeti) Next data cache'inde 5 dk tutulur; script sonrası
 *      canlıda en geç 5 dk içinde yansır (webhook akışı cache'i anında tazeler).
 */

import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';

function loadEnvFile(fileName: string) {
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
      ? { email: userArg.trim().toLowerCase(), deletedAt: null }
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
    console.error(
      user
        ? `Kullanıcı bulundu ama personalOrganizationId yok: ${user.email}`
        : `Kullanıcı bulunamadı: ${userArg}`,
    );
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
