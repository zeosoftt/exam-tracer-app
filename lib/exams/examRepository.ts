/**
 * Sınav veri erişimi — repository katmanı.
 */

import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { ConflictError } from '@/lib/errors/AppError';

export type CreateExamInput = {
  name: string;
  code: string;
  description?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  organizationId?: string | null;
};

export async function findExamByCode(code: string) {
  return prisma.exam.findFirst({
    where: { code: code.toUpperCase(), deletedAt: null },
  });
}

export async function listExams(params: {
  where: Prisma.ExamWhereInput;
  skip: number;
  take: number;
}) {
  const { where, skip, take } = params;
  return Promise.all([
    prisma.exam.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        examAssignments: {
          where: { deletedAt: null },
          select: { userId: true },
        },
      },
    }),
    prisma.exam.count({ where }),
  ]);
}

export async function createExamRecord(input: CreateExamInput) {
  const existing = await findExamByCode(input.code);
  if (existing) {
    throw new ConflictError('Bu sınav kodu zaten kullanılıyor');
  }

  return prisma.exam.create({
    data: {
      name: input.name,
      code: input.code.toUpperCase(),
      description: input.description,
      startDate: input.startDate,
      endDate: input.endDate,
      organizationId: input.organizationId ?? null,
    },
  });
}

export async function getExamContentTree() {
  return prisma.exam.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'asc' },
    include: {
      sections: {
        where: { deletedAt: null },
        orderBy: { order: 'asc' },
        include: {
          subjects: {
            where: { deletedAt: null },
            orderBy: { order: 'asc' },
            include: {
              topics: {
                where: { deletedAt: null },
                orderBy: { order: 'asc' },
                select: {
                  id: true,
                  subjectId: true,
                  name: true,
                  code: true,
                  description: true,
                  order: true,
                  examQuestionCount: true,
                },
              },
            },
          },
        },
      },
    },
  });
}
