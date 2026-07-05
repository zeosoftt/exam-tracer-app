/**
 * GET /api/organizations — kullanıcının üye olduğu organizasyonlar
 * PATCH /api/organizations — aktif org doğrulama (client session.update için)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { asyncHandler } from '@/lib/errors/errorHandler';
import { authSuccess, authFailure } from '@/lib/auth/responses';
import { requireSession, getSessionUserId } from '@/lib/auth/requireSession';
import { validate } from '@/lib/validation/validate';
import { switchOrganizationSchema } from '@/lib/validation/schemas';

async function verifyMembership(userId: string, organizationId: string) {
  return prisma.membership.findFirst({
    where: {
      userId,
      organizationId,
      isActive: true,
      deletedAt: null,
      organization: { isActive: true, deletedAt: null },
    },
    include: {
      role: { select: { code: true, name: true } },
      organization: { select: { id: true, name: true, slug: true, isPersonal: true } },
    },
  });
}

async function listOrganizationsHandler(_req: NextRequest): Promise<NextResponse> {
  const session = await requireSession();
  const userId = getSessionUserId(session);

  const memberships = await prisma.membership.findMany({
    where: {
      userId,
      isActive: true,
      deletedAt: null,
      organization: { isActive: true, deletedAt: null },
    },
    include: {
      role: { select: { code: true, name: true } },
      organization: { select: { id: true, name: true, slug: true, isPersonal: true } },
    },
    orderBy: [{ organization: { isPersonal: 'desc' } }, { joinedAt: 'desc' }],
  });

  return authSuccess(
    memberships.map((m) => ({
      organizationId: m.organization.id,
      name: m.organization.name,
      slug: m.organization.slug,
      isPersonal: m.organization.isPersonal,
      roleCode: m.role.code,
      roleName: m.role.name,
    })),
  );
}

async function switchOrganizationHandler(req: NextRequest): Promise<NextResponse> {
  const session = await requireSession();
  const userId = getSessionUserId(session);
  const { organizationId } = validate(switchOrganizationSchema, await req.json());

  const membership = await verifyMembership(userId, organizationId);
  if (!membership) {
    return authFailure('Bu organizasyona erişim yetkiniz yok.', 403);
  }

  return authSuccess({
    organizationId,
    name: membership.organization.name,
    slug: membership.organization.slug,
    isPersonal: membership.organization.isPersonal,
    roleCode: membership.role.code,
  });
}

export const GET = asyncHandler(listOrganizationsHandler);
export const PATCH = asyncHandler(switchOrganizationHandler);
