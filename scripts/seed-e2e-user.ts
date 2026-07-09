/**
 * E2E test kullanıcısı — doğrulanmış, kurulum tamamlanmış freemium hesap.
 * Kullanım: npm run e2e:seed
 */

import { prisma } from '../lib/db/prisma';
import { hashPassword } from '../lib/auth/password';
import { createFreemiumPersonalOrganization } from '../lib/billing/createFreemiumOrganization';
import { seedAll } from '../lib/auth/seedPermissions';

const email = (process.env.E2E_TEST_EMAIL ?? 'e2e@test.local').toLowerCase().trim();
const password = process.env.E2E_TEST_PASSWORD ?? 'E2eTest123!';

async function main() {
  await seedAll();

  const passwordHash = await hashPassword(password);
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: {
        passwordHash,
        emailVerified: true,
        isActive: true,
        deletedAt: null,
        setupWizardCompletedAt: new Date(),
        firstName: existing.firstName || 'E2E',
        lastName: existing.lastName || 'Tester',
      },
    });
    console.log(`✅ E2E user updated: ${email}`);
    return;
  }

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email,
        passwordHash,
        firstName: 'E2E',
        lastName: 'Tester',
        role: 'INDIVIDUAL',
        emailVerified: true,
        isActive: true,
        setupWizardCompletedAt: new Date(),
      },
    });

    await createFreemiumPersonalOrganization(
      { userId: created.id, userName: 'E2E Tester' },
      tx,
    );

    return created;
  });

  console.log(`✅ E2E user created: ${user.email} (${user.id})`);
}

main()
  .catch((err) => {
    console.error('❌ E2E seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
