import { prisma } from '@/lib/db/prisma';
import { ensureUserSecurityColumnsOnce } from '@/lib/db/ensureUserSecurityColumns';

export type SettingsUserRecord = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  targetScore: number | null;
  dailyStudyHours: number | null;
  emailNotifications: boolean;
  studyReminders: boolean;
};

export type SettingsExamOption = { id: string; name: string; code: string };

export type SettingsPayload = {
  user: SettingsUserRecord & { name: string };
  activeExam: SettingsExamOption | null;
};

const userSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  targetScore: true,
  dailyStudyHours: true,
  emailNotifications: true,
  studyReminders: true,
} as const;

function toSettingsPayload(
  user: SettingsUserRecord,
  activeExam: SettingsExamOption | null,
): SettingsPayload {
  return {
    user: { ...user, name: `${user.firstName} ${user.lastName}`.trim() },
    activeExam,
  };
}

/** Kullanıcı ayarları + aktif sınav — GET/PATCH ortak sorgu (DRY). */
export async function findUserSettings(userId: string): Promise<SettingsPayload | null> {
  await ensureUserSecurityColumnsOnce(prisma);
  const user = await prisma.user.findUnique({ where: { id: userId }, select: userSelect });
  if (!user) return null;

  const activeAssignment = await prisma.examAssignment.findFirst({
    where: {
      userId,
      deletedAt: null,
      exam: { status: 'ACTIVE', deletedAt: null },
    },
    orderBy: { assignedAt: 'desc' },
    include: { exam: { select: { id: true, name: true, code: true } } },
  });

  return toSettingsPayload(user, activeAssignment?.exam ?? null);
}

export type UpdateProfileInput = {
  firstName?: string;
  lastName?: string;
  targetScore?: number | null;
  dailyStudyHours?: number | null;
  emailNotifications?: boolean;
  studyReminders?: boolean;
};

export async function updateUserProfile(userId: string, input: UpdateProfileInput): Promise<void> {
  const data: UpdateProfileInput = {};
  if (input.firstName !== undefined) data.firstName = input.firstName;
  if (input.lastName !== undefined) data.lastName = input.lastName;
  if (input.targetScore !== undefined) data.targetScore = input.targetScore;
  if (input.dailyStudyHours !== undefined) data.dailyStudyHours = input.dailyStudyHours;
  if (input.emailNotifications !== undefined) data.emailNotifications = input.emailNotifications;
  if (input.studyReminders !== undefined) data.studyReminders = input.studyReminders;
  if (Object.keys(data).length === 0) return;
  await prisma.user.update({ where: { id: userId }, data });
}

export async function setUserActiveExam(userId: string, examId: string): Promise<boolean> {
  const exam = await prisma.exam.findFirst({
    where: { id: examId, status: 'ACTIVE', deletedAt: null },
  });
  if (!exam) return false;

  return prisma.$transaction(async (tx) => {
    const currentAssignment = await tx.examAssignment.findFirst({
      where: { userId, deletedAt: null },
      orderBy: { assignedAt: 'desc' },
    });

    if (currentAssignment?.examId === examId) return true;

    if (currentAssignment) {
      await tx.examAssignment.update({
        where: { id: currentAssignment.id },
        data: { deletedAt: new Date() },
      });
    }

    await tx.examAssignment.create({ data: { examId: exam.id, userId } });
    return true;
  });
}

export async function clearUserActiveExam(userId: string): Promise<void> {
  const currentAssignment = await prisma.examAssignment.findFirst({
    where: { userId, deletedAt: null },
    orderBy: { assignedAt: 'desc' },
  });
  if (!currentAssignment) return;
  await prisma.examAssignment.update({
    where: { id: currentAssignment.id },
    data: { deletedAt: new Date() },
  });
}

export async function listActiveExams(): Promise<SettingsExamOption[]> {
  return prisma.exam.findMany({
    where: { status: 'ACTIVE', deletedAt: null },
    select: { id: true, name: true, code: true },
    orderBy: { name: 'asc' },
  });
}
