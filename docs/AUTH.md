# Authentication & Session Architecture

Single source of truth for auth in The Goal Lab. **NextAuth (JWT)** is preserved; this document describes the standardized layers on top.

## Module map

| Concern | Location |
|---------|----------|
| NextAuth config | `lib/auth/config.ts` |
| Session lifecycle | `lib/auth/session.ts` |
| API responses | `lib/auth/responses.ts` |
| Route wrappers | `lib/auth/authRouteHelpers.ts` |
| Registration service | `lib/auth/registerService.ts` |
| Server session guard | `lib/auth/requireSession.ts` |
| Page session guard | `lib/auth/pageSession.ts` |
| RBAC (membership) | `lib/auth/authorization.ts` |
| Legacy roles | `lib/auth/permissions.ts` |
| Public routes | `lib/auth/publicRoutes.ts` |
| Client hooks | `lib/hooks/auth/*` |
| Validation | `lib/validation/schemas.ts` |
| Client forms API | `lib/client-api/authForms.ts` |

## Flows

### Registration (`POST /api/auth/register`)

1. Rate limit (IP)
2. `validate(registerSchema)`
3. `registerUser()` — single `$transaction`:
   - Create user
   - Create freemium org + membership + role
   - Optional exam assignment
4. Send verification email
5. Audit via `logAuth`
6. Response: `{ success: true, data: { id, email, ... } }`

### Login (`signIn('credentials')` via NextAuth)

Handled in `lib/auth/config.ts`:

1. Validate credentials
2. Password check (timing-safe via bcrypt)
3. Email verified check
4. Account active check
5. Resolve active organization
6. JWT session created (remember-me TTL)
7. `lastLoginAt` updated
8. `logAuth('Login successful')`

### Logout

Client: `signOutAndRedirect()` — clears session cookie, optional localStorage, redirects.

### Session refresh

- JWT max age: `NEXTAUTH_SESSION_SHORT_SECONDS` / remember variant
- Org switch: `PATCH /api/organizations` → `session.update({ activeOrganizationId })` → JWT `trigger: 'update'` validates membership

### Email verify / reset / resend

All use `wrapAuthPostHandler` + shared Zod schemas + `authSuccess` / `authFailure` / `authEnumerationSafe`.

## Response format (auth API)

**Success**

```json
{ "success": true, "data": {} }
```

**Error**

```json
{ "success": false, "message": "...", "errors": [] }
```

## Route protection

| Layer | Mechanism |
|-------|-----------|
| Edge | `middleware.ts` + `isPublicPath()` |
| Pages | `requirePageSession()` / `ProtectedSessionGuard` |
| User API | `withSessionHandler` or `requireSession()` |
| Permission API | `requirePermission()` |
| Admin API | `withAdminHandler` |
| Super-admin RBAC | `isSuperAdmin()` + legacy `ADMIN` role |

## Client hooks

```typescript
import { useSession, useCurrentUser, usePermissions, useOrganization, useRequireAuth } from '@/lib/hooks/auth';
```

## Security checklist

- [x] bcrypt password hashing
- [x] Rate limiting on auth POST routes
- [x] Email enumeration-safe forgot/resend
- [x] HttpOnly session cookies (NextAuth)
- [x] Security headers (`middleware.ts`)
- [x] Session replacement on login (login page)
- [x] callbackUrl sanitization (`sanitizeCallbackUrl`)
- [ ] Redis rate limiting (production scale)
- [ ] CSRF: NextAuth built-in for credentials

## Error page

NextAuth errors redirect to `/auth/error` (see `pages.error` in config).
