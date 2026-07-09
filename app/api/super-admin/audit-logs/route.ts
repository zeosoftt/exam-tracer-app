/**
 * GET /api/super-admin/audit-logs?page=1&limit=20&action=
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminHandler } from '@/lib/api/withAdminHandler';
import { prisma } from '@/lib/db/prisma';
import { ensureProductionTablesOnce } from '@/lib/db/ensureProductionTables';
import { PAGINATION } from '@/config/constants';

async function getAuditLogsHandler(req: NextRequest): Promise<NextResponse> {
  await ensureProductionTablesOnce(prisma);

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const limit = Math.min(
    PAGINATION.MAX_PAGE_SIZE,
    Math.max(1, parseInt(searchParams.get('limit') ?? String(PAGINATION.DEFAULT_PAGE_SIZE), 10) || PAGINATION.DEFAULT_PAGE_SIZE),
  );
  const actionFilter = searchParams.get('action')?.trim() || undefined;

  const where = actionFilter ? { action: { contains: actionFilter, mode: 'insensitive' as const } } : {};

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const actorIds = [...new Set(logs.map((l) => l.actorId))];
  const actors =
    actorIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: actorIds } },
          select: { id: true, email: true, firstName: true, lastName: true },
        })
      : [];
  const actorMap = new Map(actors.map((a) => [a.id, a]));

  const entries = logs.map((log) => {
    const actor = actorMap.get(log.actorId);
    return {
      id: log.id,
      action: log.action,
      resource: log.resource,
      ipAddress: log.ipAddress,
      createdAt: log.createdAt.toISOString(),
      actor: actor
        ? {
            id: actor.id,
            email: actor.email,
            name: `${actor.firstName} ${actor.lastName}`.trim(),
          }
        : { id: log.actorId, email: null, name: null },
    };
  });

  return NextResponse.json({
    success: true,
    data: {
      logs: entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    },
  });
}

export const GET = withAdminHandler(getAuditLogsHandler);
