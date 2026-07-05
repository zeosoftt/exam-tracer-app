/**
 * Oturum yaşam döngüsü — server-side session helpers (NextAuth JWT).
 *
 * Client components must import from `@/lib/auth/authPaths` instead.
 */

export { AUTH_PATHS, buildLoginUrl, sanitizeCallbackUrl } from '@/lib/auth/authPaths';

export {
  requireSession,
  getSessionUserId,
  toUserPermissions,
  requireAdminSession,
  guardAdminSession,
  toAuthErrorResponse,
  type AuthenticatedSession,
  type AdminSessionGuard,
} from '@/lib/auth/requireSession';

export {
  requirePageSession,
  requireAdminPageSession,
  getOptionalPageSession,
} from '@/lib/auth/pageSession';
