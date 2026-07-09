/**
 * NextAuth Configuration
 * JWT-based authentication with session management
 */

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db/prisma';
import { comparePassword } from '@/lib/auth/password';
import { logAuth, logError } from '@/lib/logger';
import {
  ERROR_MESSAGES,
  AUTH_ERROR_CODES,
  NEXTAUTH_COOKIE_MAX_AGE_SECONDS,
  NEXTAUTH_SESSION_SHORT_SECONDS,
  NEXTAUTH_SESSION_REMEMBER_SECONDS,
} from '@/config/constants';
import { ensureUserSecurityColumnsOnce } from '@/lib/db/ensureUserSecurityColumns';

const JWT_REVALIDATE_MS = 5 * 60 * 1000;

function isDatabaseConnectionError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { name?: string; code?: string; message?: string };
  if (e.name === 'PrismaClientInitializationError') return true;
  if (e.code === 'P1001' || e.code === 'P1017') return true;
  if (typeof e.message === 'string' && e.message.includes("Can't reach database")) return true;
  return false;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        remember: { label: 'Remember me', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const remember =
          credentials.remember === 'true' ||
          credentials.remember === '1' ||
          credentials.remember === 'on';

        try {
          // Find user by email (excluding soft-deleted users)
          // Use findUnique since email is unique in schema
          // Don't use select to avoid issues if migration hasn't been run yet
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email.toLowerCase(),
            },
          });

          // Check if user exists and is not soft-deleted
          if (!user || user.deletedAt !== null) {
            logAuth('Login failed: User not found or deleted', undefined, { email: credentials.email });
            throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
          }


          if (!user.isActive) {
            logAuth('Login failed: User inactive', user.id, { email: credentials.email });
            throw new Error('Account is inactive');
          }

          // Önce şifre (e-posta doğrulanmamış hesapların varlığını sızdırmamak için)
          const isPasswordValid = await comparePassword(credentials.password, user.passwordHash);

          if (!isPasswordValid) {
            logAuth('Login failed: Invalid password', user.id, { email: credentials.email });
            throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
          }

          if (!user.emailVerified) {
            logAuth('Login failed: Email not verified', user.id, { email: credentials.email });
            throw new Error(AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED);
          }

          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });

          logAuth('Login successful', user.id, { email: credentials.email, role: user.role });

          // Get user's active organization (personal or most recent membership)
          // Migration may not be done yet, so handle gracefully
          let activeOrganizationId: string | null = null;
          
          try {
            // Check if personalOrganizationId field exists in schema and user has it
            // Use type assertion to safely check for the field
            const userWithOrg = user as typeof user & { personalOrganizationId?: string | null };
            if (userWithOrg.personalOrganizationId) {
              activeOrganizationId = userWithOrg.personalOrganizationId;
            } else {
              // Try to get from memberships (only if migration is done)
              try {
                const { getActiveOrganizationId } = await import('./authorization');
                activeOrganizationId = await getActiveOrganizationId(user.id);
              } catch (membershipError: unknown) {
                // memberships table or personalOrganizationId column doesn't exist yet
                // This is OK - migration hasn't been run yet
                const error = membershipError as { code?: string; message?: string };
                if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
                  logAuth('Schema migration not done yet - skipping organization lookup', user.id);
                } else {
                  logAuth('Error getting active organization', user.id, { error: membershipError });
                }
                activeOrganizationId = null;
              }
            }
          } catch (error: unknown) {
            // Any other error - log but don't fail login
            const errorObj = error instanceof Error ? { message: error.message, name: error.name } : error;
            logAuth('Error getting active organization (non-critical)', user.id, { error: errorObj });
            activeOrganizationId = null;
          }

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            emailVerified: user.emailVerified,
            role: user.role ?? undefined, // DEPRECATED: kept for backward compatibility
            institutionId: user.institutionId ?? undefined, // DEPRECATED: kept for backward compatibility
            activeOrganizationId, // NEW: Active organization ID (null if not migrated yet)
            remember,
            tokenVersion: (user as { tokenVersion?: number }).tokenVersion ?? 0,
          } as const;
        } catch (error) {
          if (isDatabaseConnectionError(error)) {
            logError('Auth: database unreachable', error);
            throw new Error(AUTH_ERROR_CODES.DATABASE_UNAVAILABLE);
          }
          logError('Auth error', error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: NEXTAUTH_COOKIE_MAX_AGE_SECONDS,
  },
  jwt: {
    maxAge: NEXTAUTH_COOKIE_MAX_AGE_SECONDS,
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        const userWithAuth = user as {
          emailVerified?: boolean;
          role?: string;
          institutionId?: string | null;
          activeOrganizationId?: string | null;
          remember?: boolean;
          tokenVersion?: number;
        };
        token.emailVerified = userWithAuth.emailVerified === true;
        token.remember = userWithAuth.remember === true;
        token.sessionStartedAt = Date.now();
        token.tokenVersion = userWithAuth.tokenVersion ?? 0;
        token.userValidatedAt = Date.now();

        // DEPRECATED: Legacy fields (kept for backward compatibility)
        token.role = userWithAuth.role;
        token.institutionId = userWithAuth.institutionId;

        // NEW: Active organization ID for multi-tenant support
        token.activeOrganizationId = userWithAuth.activeOrganizationId;
      }

      if (trigger === 'update' && session && typeof token.id === 'string') {
        const nextOrgId =
          session.activeOrganizationId === null || session.activeOrganizationId === undefined
            ? null
            : String(session.activeOrganizationId);

        if (nextOrgId) {
          const membership = await prisma.membership.findFirst({
            where: {
              userId: token.id,
              organizationId: nextOrgId,
              isActive: true,
              deletedAt: null,
            },
            select: { id: true },
          });
          if (membership) {
            token.activeOrganizationId = nextOrgId;
          }
        } else {
          token.activeOrganizationId = null;
        }
      }

      const remember = token.remember === true;
      const limitSec = remember ? NEXTAUTH_SESSION_REMEMBER_SECONDS : NEXTAUTH_SESSION_SHORT_SECONDS;
      const startedMs =
        typeof token.sessionStartedAt === 'number'
          ? token.sessionStartedAt
          : typeof token.iat === 'number'
            ? token.iat * 1000
            : Date.now();
      if (token.id && Date.now() - startedMs > limitSec * 1000) {
        logAuth('JWT expired (session length policy)', String(token.id));
        return { ...token, id: undefined, exp: Math.floor(Date.now() / 1000) - 10 };
      }

      if (typeof token.id === 'string') {
        const lastValidated =
          typeof token.userValidatedAt === 'number' ? token.userValidatedAt : 0;
        if (Date.now() - lastValidated > JWT_REVALIDATE_MS) {
          try {
            await ensureUserSecurityColumnsOnce(prisma);
            const dbUser = await prisma.user.findUnique({
              where: { id: token.id },
              select: {
                isActive: true,
                deletedAt: true,
                emailVerified: true,
                role: true,
                tokenVersion: true,
              },
            });
            if (!dbUser || dbUser.deletedAt !== null || !dbUser.isActive) {
              logAuth('JWT invalidated: user inactive or deleted', token.id);
              return { ...token, id: undefined, exp: Math.floor(Date.now() / 1000) - 10 };
            }
            const jwtVersion = typeof token.tokenVersion === 'number' ? token.tokenVersion : 0;
            const dbVersion = dbUser.tokenVersion ?? 0;
            if (jwtVersion !== dbVersion) {
              logAuth('JWT invalidated: tokenVersion mismatch', token.id);
              return { ...token, id: undefined, exp: Math.floor(Date.now() / 1000) - 10 };
            }
            token.emailVerified = dbUser.emailVerified;
            token.role = dbUser.role ?? undefined;
            token.tokenVersion = dbVersion;
            token.userValidatedAt = Date.now();
          } catch (revalidateError) {
            logError('JWT revalidation failed (non-fatal)', revalidateError);
          }
        }
      }

      // Verify token still has valid user ID
      if (!token.id) {
        logAuth('JWT token missing user ID', undefined);
        return token;
      }

      return token;
    },
    async session({ session, token }) {
      // Verify token has valid user ID before setting session
      if (!token.id) {
        logAuth('Session callback: Token missing user ID', undefined);
        return {
          expires: new Date(0).toISOString(),
          user: {
            id: '',
            email: '',
            name: '',
            emailVerified: false,
          },
        };
      }
      
      if (session.user) {
        session.user.id = String(token.id);
        session.user.email = token.email ? String(token.email) : session.user.email;
        
        // DEPRECATED: Legacy fields (kept for backward compatibility)
        if (token.role) {
          session.user.role = String(token.role);
        }
        if (token.institutionId !== undefined) {
          session.user.institutionId = token.institutionId ? String(token.institutionId) : null;
        }
        
        // NEW: Active organization ID
        if (token.activeOrganizationId !== undefined) {
          session.user.activeOrganizationId = token.activeOrganizationId
            ? String(token.activeOrganizationId)
            : null;
        }
        session.user.emailVerified = token.emailVerified === true;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV === 'development' ? 'development-secret-key-change-in-production' : undefined),
  debug: process.env.NODE_ENV === 'development',
};

// Validate required environment variables
if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('NEXTAUTH_SECRET environment variable is required in production');
}

if (!process.env.NEXTAUTH_URL && process.env.NODE_ENV === 'production') {
  throw new Error('NEXTAUTH_URL environment variable is required in production');
}
