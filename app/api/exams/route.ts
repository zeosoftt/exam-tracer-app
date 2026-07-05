/**
 * Exams API Endpoint
 * GET /api/exams - List exams
 * POST /api/exams - Create exam
 */

import { NextRequest, NextResponse } from 'next/server';
import { toUserPermissions } from '@/lib/auth/requireSession';
import { getActiveOrganizationId } from '@/lib/auth/authorization';
import { canPerformAction } from '@/lib/auth/planLimits';
import { asyncHandler } from '@/lib/errors/errorHandler';
import { validate } from '@/lib/validation/validate';
import { createExamSchema, paginationSchema } from '@/lib/validation/schemas';
import { canCreateExam } from '@/lib/auth/permissions';
import { createExamRecord, listExams } from '@/lib/exams/examRepository';
import { jsonCreated } from '@/lib/api/responses';
import { logApi } from '@/lib/logger';
import { HTTP_STATUS } from '@/config/constants';
import { ForbiddenError } from '@/lib/errors/AppError';
import { getPaginationParams, getSkip, createPaginatedResponse } from '@/lib/utils/pagination';
import { requirePermission } from '@/lib/middleware/authorization';

const getExamsHandler = requirePermission('EXAM_VIEW')(async (req, { userId, session }) => {
  const userPermissions = toUserPermissions(session);

  const { searchParams } = new URL(req.url);
  const pagination = validate(paginationSchema, {
    page: searchParams.get('page'),
    pageSize: searchParams.get('pageSize'),
  });

  const { page, pageSize } = getPaginationParams(pagination.page, pagination.pageSize);
  const skip = getSkip(page, pageSize);

  const where: Parameters<typeof listExams>[0]['where'] = { deletedAt: null };

  if (!canCreateExam(userPermissions)) {
    where.examAssignments = {
      some: {
        OR: [{ userId }, { institutionId: session.user.institutionId }],
        deletedAt: null,
      },
    };
  }

  const [exams, total] = await listExams({ where, skip, take: pageSize });
  const response = createPaginatedResponse(exams, total, page, pageSize);
  logApi('GET', '/api/exams', HTTP_STATUS.OK, undefined, { userId });

  return NextResponse.json({ success: true, ...response });
});

const createExamHandler = requirePermission('EXAM_CREATE', { resourceType: 'EXAMS' })(
  async (req, { userId, organizationId }) => {
    const body = await req.json();
    const validatedData = validate(createExamSchema, body);

    const orgId = organizationId ?? (await getActiveOrganizationId(userId));
    if (orgId) {
      const limit = await canPerformAction(orgId, 'CREATE_EXAM');
      if (!limit.allowed) {
        throw new ForbiddenError(limit.reason ?? 'Plan limiti nedeniyle yeni sınav oluşturulamaz.');
      }
    }

    const exam = await createExamRecord({
      name: validatedData.name,
      code: validatedData.code,
      description: validatedData.description,
      startDate: validatedData.startDate,
      endDate: validatedData.endDate,
      organizationId: orgId,
    });

    logApi('POST', '/api/exams', HTTP_STATUS.CREATED, undefined, { userId, examId: exam.id });
    return jsonCreated(exam);
  },
);

export const GET = asyncHandler(getExamsHandler);
export const POST = asyncHandler(createExamHandler);
