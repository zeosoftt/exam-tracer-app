/**
 * Varsayılan Freemium (FREE) kişisel organizasyon oluşturur.
 * Her yeni kayıt ve mevcut kullanıcılar için kullanılır.
 */

import { prisma } from '@/lib/db/prisma';

const FREE_PLAN_CODE = 'FREE';
const DEFAULT_ROLE_CODE = 'SYSTEM_ROLE_ORG_ADMIN'; // Kişisel workspace için org admin

export interface CreateFreemiumOrganizationParams {
  userId: string;
  userName: string;
}

/**
 * Kullanıcı için Freemium (FREE) planlı kişisel organizasyon oluşturur,
 * membership atar ve kullanıcının personalOrganizationId alanını günceller.
 * FREE plan yoksa veya role yoksa hata fırlatır.
 */
export async function createFreemiumPersonalOrganization(
  params: CreateFreemiumOrganizationParams
): Promise<string> {
  const { userId, userName } = params;
  const displayName = (userName || 'Kullanıcı').trim() || 'Kullanıcı';

  const [freePlan, orgAdminRole] = await Promise.all([
    prisma.plan.findUnique({ where: { code: FREE_PLAN_CODE }, select: { id: true } }),
    prisma.role.findUnique({ where: { code: DEFAULT_ROLE_CODE }, select: { id: true } }),
  ]);

  if (!freePlan) {
    throw new Error('FREE plan bulunamadı. Lütfen seed çalıştırın: npm run db:seed:auth');
  }
  if (!orgAdminRole) {
    throw new Error('Varsayılan rol bulunamadı. Lütfen seed çalıştırın: npm run db:seed:auth');
  }

  const slug = `personal-${userId}`;
  const code = `PERSONAL-${userId}`;

  const org = await prisma.organization.create({
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

  await prisma.user.update({
    where: { id: userId },
    data: { personalOrganizationId: org.id },
  });

  return org.id;
}
