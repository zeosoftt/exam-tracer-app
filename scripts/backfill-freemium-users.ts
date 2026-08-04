/**
 * Mevcut kullanıcıları Freemium yapar: personalOrganizationId olmayan
 * her kullanıcı için FREE planlı kişisel organizasyon oluşturur.
 *
 * Kullanım: npx tsx scripts/backfill-freemium-users.ts
 * Önce seed gerekir: npm run db:seed:auth
 */

import { prisma } from '../lib/db/prisma';
import { createFreemiumPersonalOrganization } from '../lib/billing/createFreemiumOrganization';

async function main() {
  const users = await prisma.user.findMany({
    where: {
      personalOrganizationId: null,
      deletedAt: null,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  });

  console.log(`Toplam ${users.length} kullanıcı için Freemium organizasyon oluşturulacak.`);

  let ok = 0;
  let fail = 0;

  for (const user of users) {
    const name = ([user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email) ?? 'Kullanıcı';
    try {
      await createFreemiumPersonalOrganization({
        userId: user.id,
        userName: name,
      });
      ok++;
      console.log(`[OK] ${user.email} -> Freemium org oluşturuldu`);
    } catch (e) {
      fail++;
      console.error(`[FAIL] ${user.email}`, e);
    }
  }

  console.log(`\nBitti. Başarılı: ${ok}, Hata: ${fail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
