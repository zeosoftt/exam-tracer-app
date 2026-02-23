/**
 * Super Admin Stats API
 * GET /api/super-admin/stats
 * Sadece ADMIN rolü erişebilir.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { USER_ROLES, HTTP_STATUS, ERROR_MESSAGES } from '@/config/constants';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.UNAUTHORIZED },
      { status: HTTP_STATUS.UNAUTHORIZED }
    );
  }
  if (session.user.role !== USER_ROLES.ADMIN) {
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.FORBIDDEN },
      { status: HTTP_STATUS.FORBIDDEN }
    );
  }

  try {
    const [usersCount, activeUsersCount, examsCount, pomodoroSessionsCount, examAssignmentsCount] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { deletedAt: null, isActive: true } }),
      prisma.exam.count({ where: { deletedAt: null } }),
      prisma.pomodoroSession.count({ where: { deletedAt: null } }),
      prisma.examAssignment.count({ where: { deletedAt: null } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        usersCount,
        activeUsersCount,
        examsCount,
        pomodoroSessionsCount,
        examAssignmentsCount,
      },
    });
  } catch (error) {
    console.error('Super admin stats error:', error);
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.INTERNAL_ERROR },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
