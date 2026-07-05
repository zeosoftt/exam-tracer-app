/**
 * Varsayılan Freemium (FREE) kişisel organizasyon oluşturur.
 * Her yeni kayıt ve mevcut kullanıcılar için kullanılır.
 */

import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

const FREE_PLAN_CODE = 'FREE';
const DEFAULT_ROLE_CODE = 'SYSTEM_ROLE_ORG_ADMIN';

export interface CreateFreemiumOrganizationParams {
  userId: string;
  userName: string;
}

type DbClient = Prisma.TransactionClient | typeof prisma;

/**
 * Kullanıcı için Freemium (FREE) planlı kişisel organizasyon oluşturur,
 * membership atar ve kullanıcının personalOrganizationId alanını günceller.
 */
export async function createFreemiumPersonalOrganization(
  params: CreateFreemiumOrganizationParams,
  client: DbClient = prisma,
): Promise<string> {
  const { userId, userName } = params;
  const displayName = (userName || 'Kullanıcı').trim() || 'Kullanıcı';

  const [freePlan, orgAdminRole] = await Promise.all([
    client.plan.findUnique({ where: { code: FREE_PLAN_CODE }, select: { id: true } }),
    client.role.findUnique({ where: { code: DEFAULT_ROLE_CODE }, select: { id: true } }),
  ]);

  if (!freePlan) {
    throw new Error('FREE plan bulunamadı. Lütfen seed çalıştırın: npm run db:seed:auth');
  }
  if (!orgAdminRole) {
    throw new Error('Varsayılan rol bulunamadı. Lütfen seed çalıştırın: npm run db:seed:auth');
  }

  const slug = `personal-${userId}`;
  const code = `PERSONAL-${userId}`;

  const org = await client.organization.create({
    data: {
      name: `${displayName} - Alan`,
      slug,
      code,
      isPersonal: true,
      currentPlanId: freePlan.id,
      maxUsers: 1,
      maxExams: 3,
      maxStudents: 10,
      memberships: {
        create: {
          userId,
          roleId: orgAdminRole.id,
        },
      },
    },
    select: { id: true },
  });

  await client.user.update({
    where: { id: userId },
    data: {
      personalOrganizationId: org.id,
      currentPlanId: freePlan.id,
    },
  });

  return org.id;
}
