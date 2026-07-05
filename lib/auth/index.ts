/**
 * Auth modülü — tek giriş noktası.
 */

export * from './session';
export { AUTH_PATHS, buildLoginUrl, sanitizeCallbackUrl } from './authPaths';
export * from './responses';
export * from './publicRoutes';
export { wrapAuthPostHandler, readAuthJsonBody, type AuthRateLimiter } from './authRouteHelpers';
export { registerUser, type RegisterInput, type RegisterResult } from './registerService';
export { hashPassword, comparePassword } from './password';
export { issueVerificationEmailForUser } from './issueVerificationEmail';
export { canCreateExam, canViewExam, type UserPermissions } from './permissions';
export { authorize, canAccess, getActiveOrganizationId, isSuperAdmin } from './authorization';
