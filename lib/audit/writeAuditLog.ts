/**
 * Admin işlemleri için audit log kaydı.
 */

import type { Prisma } from '@prisma/client';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { ensureProductionTablesOnce } from '@/lib/db/ensureProductionTables';
import { logError } from '@/lib/logger';

export type WriteAuditLogParams = {
  actorId: string;
  action: string;
  resource?: string;
  metadata?: Record<string, unknown>;
  req?: NextRequest;
};

export async function writeAuditLog(params: WriteAuditLogParams): Promise<void> {
  try {
    await ensureProductionTablesOnce(prisma);
    const forwarded = params.req?.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : params.req?.headers.get('x-real-ip');

    await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        resource: params.resource,
        metadata: (params.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
        ipAddress: ip ?? undefined,
      },
    });
  } catch (error) {
    logError('Audit log write failed', error instanceof Error ? error : new Error(String(error)), {
      action: params.action,
    });
  }
}
