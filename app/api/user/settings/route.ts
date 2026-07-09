/**
 * User Settings API — ince handler; veri erişimi settingsRepository (DRY).
 */

import { NextRequest, NextResponse } from 'next/server';
import { validate } from '@/lib/validation/validate';
import { updateUserSettingsSchema } from '@/lib/validation/schemas';
import { asyncHandler, handleError } from '@/lib/errors/errorHandler';
import { requireSession, getSessionUserId } from '@/lib/auth/requireSession';
import { HTTP_STATUS } from '@/config/constants';
import { prisma } from '@/lib/db/prisma';
import { findUserSettings } from '@/lib/settings/settingsRepository';

async function getSettingsHandler(): Promise<NextResponse> {
  const session = await requireSession();
  const data = await findUserSettings(getSessionUserId(session));
  if (!data) {
    return NextResponse.json({ success: false, error: { message: 'Kullanıcı bulunamadı' } }, { status: 401 });
  }
  return NextResponse.json({ success: true, data });
}

async function patchSettingsHandler(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await requireSession();
    const userId = getSessionUserId(session);
    const validated = validate(updateUserSettingsSchema, await req.json());

    if (validated.examId !== undefined && validated.examId !== '') {
      const exam = await prisma.exam.findFirst({
        where: { id: validated.examId, status: 'ACTIVE', deletedAt: null },
        select: { id: true },
      });
      if (!exam) {
        return NextResponse.json(
          { success: false, error: { message: 'Geçersiz sınav' } },
          { status: HTTP_STATUS.BAD_REQUEST },
        );
      }
    }

    await prisma.$transaction(async (tx) => {
      const profileData: {
        firstName?: string;
        lastName?: string;
        targetScore?: number | null;
        dailyStudyHours?: number | null;
        emailNotifications?: boolean;
        studyReminders?: boolean;
      } = {};
      if (validated.firstName !== undefined) profileData.firstName = validated.firstName;
      if (validated.lastName !== undefined) profileData.lastName = validated.lastName;
      if (validated.targetScore !== undefined) profileData.targetScore = validated.targetScore;
      if (validated.dailyStudyHours !== undefined) profileData.dailyStudyHours = validated.dailyStudyHours;
      if (validated.emailNotifications !== undefined) {
        profileData.emailNotifications = validated.emailNotifications;
      }
      if (validated.studyReminders !== undefined) profileData.studyReminders = validated.studyReminders;

      if (Object.keys(profileData).length > 0) {
        await tx.user.update({ where: { id: userId }, data: profileData });
      }

      if (validated.examId !== undefined) {
        if (validated.examId === '') {
          const current = await tx.examAssignment.findFirst({
            where: { userId, deletedAt: null },
            orderBy: { assignedAt: 'desc' },
          });
          if (current) {
            await tx.examAssignment.update({
              where: { id: current.id },
              data: { deletedAt: new Date() },
            });
          }
        } else {
          const current = await tx.examAssignment.findFirst({
            where: { userId, deletedAt: null },
            orderBy: { assignedAt: 'desc' },
          });
          if (current?.examId !== validated.examId) {
            if (current) {
              await tx.examAssignment.update({
                where: { id: current.id },
                data: { deletedAt: new Date() },
              });
            }
            await tx.examAssignment.create({
              data: { examId: validated.examId, userId },
            });
          }
        }
      }
    });

    const data = await findUserSettings(userId);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleError(error);
  }
}

export const GET = asyncHandler(getSettingsHandler);
export const PATCH = asyncHandler(patchSettingsHandler);
