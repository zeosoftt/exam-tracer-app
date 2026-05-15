/**
 * İlk giriş — interaktif kurulum sihirbazı (konu + örnek deneme)
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/prisma';
import { ensureSetupWizardColumnOnce } from '@/lib/db/ensureSetupWizardColumn';
import { isMissingSetupWizardColumnError } from '@/lib/db/setupWizardColumnSupport';
import { USER_ROLES } from '@/config/constants';
import SetupWizardClient from '@/components/setup-wizard/SetupWizardClient';

export default async function SetupWizardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const role = session.user.role ?? '';
  if (role === USER_ROLES.ADMIN || role === USER_ROLES.VIEWER) {
    redirect('/dashboard');
  }

  await ensureSetupWizardColumnOnce(prisma);

  let user: { setupWizardCompletedAt: Date | null; firstName: string } | null;
  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { setupWizardCompletedAt: true, firstName: true },
    });
  } catch (e) {
    if (isMissingSetupWizardColumnError(e)) {
      redirect('/dashboard');
    }
    throw e;
  }

  if (user?.setupWizardCompletedAt) {
    redirect('/dashboard');
  }

  const assignments = await prisma.examAssignment.findMany({
    where: {
      userId: session.user.id,
      deletedAt: null,
      exam: { status: 'ACTIVE', deletedAt: null },
    },
    orderBy: { assignedAt: 'desc' },
    include: {
      exam: { select: { id: true, name: true, code: true } },
    },
  });

  const assignmentList = assignments.map((a) => ({
    examId: a.exam.id,
    name: a.exam.name,
    code: a.exam.code,
  }));

  let availableExams: { examId: string; name: string; code: string }[] = [];
  if (assignmentList.length === 0) {
    const exams = await prisma.exam.findMany({
      where: { status: 'ACTIVE', deletedAt: null },
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
      take: 40,
    });
    availableExams = exams.map((e) => ({ examId: e.id, name: e.name, code: e.code }));
  }

  const lockedExam = assignmentList[0] ?? availableExams[0] ?? null;

  return (
    <SetupWizardClient
      userFirstName={user?.firstName?.trim() || 'Merhaba'}
      lockedExam={lockedExam}
    />
  );
}
