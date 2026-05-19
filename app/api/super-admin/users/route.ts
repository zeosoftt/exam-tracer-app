/**
 * Super Admin Users API
 * GET /api/super-admin/users?page=1&limit=20
 * Sadece ADMIN rolü erişebilir.
 */

import { NextRequest, NextResponse } from 'next/server';
import { guardAdminSession } from '@/lib/auth/requireSession';
import { prisma } from '@/lib/db/prisma';
import { HTTP_STATUS, ERROR_MESSAGES, PAGINATION } from '@/config/constants';
import { getAcquisitionSourceLabel } from '@/lib/marketing/acquisitionSources';

const examAssignmentsSelect = {
  where: { deletedAt: null },
  orderBy: { assignedAt: 'desc' as const },
  select: {
    examId: true,
    exam: {
      select: { id: true, name: true, code: true, deletedAt: true },
    },
  },
};

const userSelectBase = {
  id: true,
  email: true,
  emailVerified: true,
  firstName: true,
  lastName: true,
  role: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  examAssignments: examAssignmentsSelect,
} as const;

const userSelectWithAcquisition = {
  ...userSelectBase,
  acquisitionSource: true,
  acquisitionSourceDetail: true,
} as const;

function isMissingAcquisitionColumns(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes('acquisitionSource') ||
    msg.includes('acquisition_source') ||
    msg.includes('acquisitionSourceDetail') ||
    msg.includes('acquisition_source_detail')
  );
}

export async function GET(req: NextRequest) {
  const guard = await guardAdminSession();
  if (!guard.authorized) return guard.response;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(
      PAGINATION.MAX_PAGE_SIZE,
      Math.max(PAGINATION.MIN_PAGE_SIZE, parseInt(searchParams.get('limit') || '20', 10))
    );
    const skip = (page - 1) * limit;

    const listArgs = {
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' as const },
      skip,
      take: limit,
    };

    let rawUsers: Array<{
      id: string;
      email: string;
      emailVerified: boolean;
      firstName: string;
      lastName: string;
      role: string | null;
      isActive: boolean;
      lastLoginAt: Date | null;
      createdAt: Date;
      acquisitionSource?: string | null;
      acquisitionSourceDetail?: string | null;
      examAssignments: Array<{
        examId: string;
        exam: { id: string; name: string; code: string; deletedAt: Date | null };
      }>;
    }>;
    let totalUsers: number;

    try {
      const [rows, total] = await Promise.all([
        prisma.user.findMany({
          ...listArgs,
          select: userSelectWithAcquisition,
        }),
        prisma.user.count({ where: { deletedAt: null } }),
      ]);
      rawUsers = rows;
      totalUsers = total;
    } catch (firstError) {
      if (!isMissingAcquisitionColumns(firstError)) {
        throw firstError;
      }
      const [rows, total] = await Promise.all([
        prisma.user.findMany({
          ...listArgs,
          select: userSelectBase,
        }),
        prisma.user.count({ where: { deletedAt: null } }),
      ]);
      rawUsers = rows.map((r) => ({
        ...r,
        acquisitionSource: null as string | null,
        acquisitionSourceDetail: null as string | null,
      }));
      totalUsers = total;
    }

    const users = rawUsers.map(({ examAssignments, acquisitionSource, acquisitionSourceDetail, ...u }) => {
      const seen = new Set<string>();
      const exams: { id: string; name: string; code: string }[] = [];
      for (const row of examAssignments) {
        const ex = row.exam;
        if (ex.deletedAt) continue;
        if (seen.has(ex.id)) continue;
        seen.add(ex.id);
        exams.push({ id: ex.id, name: ex.name, code: ex.code });
      }
      const hearAboutLabel = getAcquisitionSourceLabel(
        acquisitionSource ?? null,
        acquisitionSourceDetail ?? null
      );
      return {
        ...u,
        exams,
        acquisitionSource: acquisitionSource ?? null,
        acquisitionSourceDetail: acquisitionSourceDetail ?? null,
        hearAboutLabel,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total: totalUsers,
          totalPages: Math.ceil(totalUsers / limit),
        },
      },
    });
  } catch (error) {
    console.error('Super admin users list error:', error);
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.INTERNAL_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
