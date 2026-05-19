/**
 * API route oturum doğrulama — getServerSession tekrarını keser (DRY).
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { ERROR_MESSAGES, HTTP_STATUS, USER_ROLES } from '@/config/constants';
import { ForbiddenError, UnauthorizedError } from '@/lib/errors/AppError';
import type { UserPermissions } from '@/lib/auth/permissions';

export type AuthenticatedSession = Session & {
  user: NonNullable<Session['user']> & { id: string };
};

export async function requireSession(): Promise<AuthenticatedSession> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }
  return session as AuthenticatedSession;
}

export function getSessionUserId(session: AuthenticatedSession): string {
  return session.user.id;
}

export function toUserPermissions(session: AuthenticatedSession): UserPermissions {
  return {
    role: session.user.role as UserPermissions['role'],
    institutionId: session.user.institutionId,
    userId: session.user.id,
  };
}

/** asyncHandler kullanan route'lar — yetkisiz/ yasak durumda throw eder. */
export async function requireAdminSession(): Promise<AuthenticatedSession> {
  const session = await requireSession();
  if (session.user.role !== USER_ROLES.ADMIN) {
    throw new ForbiddenError();
  }
  return session;
}

export type AdminSessionGuard =
  | { authorized: true; session: AuthenticatedSession }
  | { authorized: false; response: NextResponse };

/** Manuel JSON response dönen route'lar — UnauthorizedError / ForbiddenError → NextResponse. */
export function toAuthErrorResponse(error: unknown): NextResponse | null {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json(
      { success: false, error: ERROR_MESSAGES.UNAUTHORIZED },
      { status: HTTP_STATUS.UNAUTHORIZED },
    );
  }
  if (error instanceof ForbiddenError) {
    return NextResponse.json(
      { success: false, error: error.message || ERROR_MESSAGES.FORBIDDEN },
      { status: HTTP_STATUS.FORBIDDEN },
    );
  }
  return null;
}

/** Manuel JSON response dönen super-admin route'ları için. */
export async function guardAdminSession(): Promise<AdminSessionGuard> {
  try {
    const session = await requireAdminSession();
    return { authorized: true, session };
  } catch (error) {
    const response = toAuthErrorResponse(error);
    if (response) {
      return { authorized: false, response };
    }
    throw error;
  }
}
