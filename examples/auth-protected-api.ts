/**
 * Example: Authorization-Protected API Routes
 * 
 * Shows how to use the authorization middleware to protect API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, requirePermissionAndLimit, getAuthContext } from '@/lib/middleware/authorization';
import { prisma } from '@/lib/db/prisma';

// ============================================================================
// EXAMPLE 1: Simple Permission Check
// ============================================================================

/**
 * GET /api/exams
 * Requires: EXAM_VIEW permission
 */
export const GET = requirePermission('EXAM_VIEW')(
  async (req: NextRequest, { userId, organizationId }) => {
    // organizationId is automatically extracted from header/query or user's active org
    
    const exams = await prisma.exam.findMany({
      where: {
        // Filter by organization if not super admin
        organizationId: organizationId || undefined,
        deletedAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      data: exams,
    });
  }
);

// ============================================================================
// EXAMPLE 2: Permission + Plan Limit Check
// ============================================================================

/**
 * POST /api/exams
 * Requires: EXAM_CREATE permission
 * Checks: Plan limit for EXAMS
 */
export const POST = requirePermissionAndLimit('EXAM_CREATE', 'EXAMS')(
  async (req: NextRequest, { userId, organizationId }) => {
    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: 'Organization ID required' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, code, description } = body;

    const exam = await prisma.exam.create({
      data: {
        name,
        code,
        description,
        organizationId, // Set organization ownership
      },
    });

    return NextResponse.json({
      success: true,
      data: exam,
    }, { status: 201 });
  }
);

// ============================================================================
// EXAMPLE 3: Manual Authorization Check
// ============================================================================

/**
 * DELETE /api/exams/[id]
 * Manual authorization check with custom logic
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
): Promise<NextResponse> {
  try {
    // Get auth context
    const { userId, organizationId } = await getAuthContext(req);

    // Resolve params (Next.js 15+ makes params async)
    const resolvedParams = await Promise.resolve(params);
    const examId = resolvedParams.id;

    // Get exam (with soft delete check)
    const exam = await prisma.exam.findFirst({
      where: {
        id: examId,
        deletedAt: null, // Soft delete check
      },
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: 'Exam not found' },
        { status: 404 }
      );
    }

    // Check permission
    const { authorize } = await import('@/lib/auth/authorization');
    const authResult = await authorize(userId, organizationId, 'EXAM_DELETE');

    if (!authResult.allowed) {
      return NextResponse.json(
        { success: false, error: authResult.reason || 'Permission denied' },
        { status: 403 }
      );
    }

    // Additional check: Can only delete own organization's exams (unless super admin)
    if (exam.organizationId && exam.organizationId !== organizationId) {
      const { isSuperAdmin } = await import('@/lib/auth/authorization');
      if (!(await isSuperAdmin(userId))) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete exam from another organization' },
          { status: 403 }
        );
      }
    }

    // Delete exam (soft delete)
    await prisma.exam.update({
      where: { id: examId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: 'Exam deleted',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// EXAMPLE 4: Feature-Based Access
// ============================================================================

import { requireFeature } from '@/lib/middleware/authorization';

/**
 * GET /api/exports/csv
 * Requires: EXPORT_CSV feature (plan-based)
 * 
 * NOTE: This example uses a different route name to avoid conflict with the GET above
 * In real usage, use different route paths like /api/exports/csv
 */
export const GET_CSV = requireFeature('EXPORT_CSV')(
  async (req: NextRequest, { userId, organizationId }) => {
    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: 'Organization ID required' },
        { status: 400 }
      );
    }

    // Generate CSV export
    const csvData = '...'; // Your CSV generation logic

    return new NextResponse(csvData, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="export.csv"',
      },
    });
  }
);

// ============================================================================
// EXAMPLE 5: Multiple Permissions (OR logic)
// ============================================================================

/**
 * GET /api/users
 * Requires: USER_VIEW OR STUDENT_VIEW permission
 * 
 * NOTE: This example uses a different route name to avoid conflict
 * In real usage, use different route paths like /api/users
 */
export const GET_USERS = async (req: NextRequest): Promise<NextResponse> => {
  const { userId, organizationId } = await getAuthContext(req);

  // Check multiple permissions (OR logic)
  const { canAccess } = await import('@/lib/auth/authorization');
  const canViewUsers = await canAccess(userId, organizationId, 'USER_VIEW');
  const canViewStudents = await canAccess(userId, organizationId, 'STUDENT_VIEW');

  if (!canViewUsers.allowed && !canViewStudents.allowed) {
    return NextResponse.json(
      { success: false, error: 'Permission denied' },
      { status: 403 }
    );
  }

  // Fetch users based on permission
  const users = await prisma.user.findMany({
    where: {
      deletedAt: null, // Soft delete check
      // Apply filters based on permission
    },
  });

  return NextResponse.json({
    success: true,
    data: users,
  });
};
