/**
 * Server Component sayfaları — getServerSession + redirect tekrarını keser (DRY).
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { USER_ROLES } from '@/config/constants';
import { prisma } from '@/lib/db/prisma';
import { ensureSetupWizardColumnOnce } from '@/lib/db/ensureSetupWizardColumn';
import { isMissingSetupWizardColumnError } from '@/lib/db/setupWizardColumnSupport';
import { canCreateExam } from '@/lib/auth/permissions';
import type { AuthenticatedSession } from '@/lib/auth/requireSession';
import { toUserPermissions } from '@/lib/auth/requireSession';

export type { AuthenticatedSession };

export async function getOptionalPageSession(): Promise<AuthenticatedSession | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session as AuthenticatedSession;
}

export async function requirePageSession(loginPath = '/auth/login'): Promise<AuthenticatedSession> {
  const session = await getOptionalPageSession();
  if (!session) redirect(loginPath);
  return session;
}

export async function requireAdminPageSession(options?: {
  loginPath?: string;
  forbiddenPath?: string;
}): Promise<AuthenticatedSession> {
  const session = await requirePageSession(options?.loginPath);
  if (session.user.role !== USER_ROLES.ADMIN) {
    redirect(options?.forbiddenPath ?? '/dashboard');
  }
  return session;
}

export async function requireExamCreatorPageSession(): Promise<AuthenticatedSession> {
  const session = await requirePageSession();
  if (!canCreateExam(toUserPermissions(session))) {
    redirect('/dashboard/exams');
  }
  return session;
}

/** ADMIN/VIEWER dışındaki kullanıcılar kurulum sihirbazını tamamlamadıysa yönlendir. */
export async function redirectIfSetupWizardIncomplete(session: AuthenticatedSession): Promise<void> {
  const role = session.user.role ?? '';
  if (role === USER_ROLES.ADMIN || role === USER_ROLES.VIEWER) return;

  await ensureSetupWizardColumnOnce(prisma);
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { setupWizardCompletedAt: true },
    });
    if (!user?.setupWizardCompletedAt) {
      redirect('/dashboard/setup-wizard');
    }
  } catch (error) {
    if (!isMissingSetupWizardColumnError(error)) throw error;
  }
}

/** Kurulum sihirbazı sayfası — ADMIN/VIEWER panele gider. */
export function redirectIfSetupWizardSkippedRole(
  session: AuthenticatedSession,
  target = '/dashboard',
): void {
  const role = session.user.role ?? '';
  if (role === USER_ROLES.ADMIN || role === USER_ROLES.VIEWER) {
    redirect(target);
  }
}
