/**
 * Admin erişim kontrolü — sayfa ve API için ortak mantık.
 */

import { USER_ROLES } from '@/config/constants';
import { isSuperAdmin } from '@/lib/auth/authorization';
import type { AuthenticatedSession } from '@/lib/auth/requireSession';

export async function userHasAdminAccess(session: AuthenticatedSession): Promise<boolean> {
  if (session.user.role === USER_ROLES.ADMIN) {
    return true;
  }
  return isSuperAdmin(session.user.id);
}
