/**
 * NextAuth Configuration
 * JWT-based authentication with session management
 */

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db/prisma';
import { comparePassword } from '@/lib/auth/password';
import { logAuth, logError } from '@/lib/logger';
import { ERROR_MESSAGES } from '@/config/constants';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          // Find user by email (excluding soft-deleted users)
          const user = await prisma.user.findFirst({
            where: {
              email: credentials.email.toLowerCase(),
              deletedAt: null,
            },
          });

          if (!user) {
            logAuth('Login failed: User not found', undefined, { email: credentials.email });
            throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
          }

          if (!user.isActive) {
            logAuth('Login failed: User inactive', user.id, { email: credentials.email });
            throw new Error('Account is inactive');
          }

          // Verify password
          const isPasswordValid = await comparePassword(credentials.password, user.passwordHash);

          if (!isPasswordValid) {
            logAuth('Login failed: Invalid password', user.id, { email: credentials.email });
            throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
          }

          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });

          logAuth('Login successful', user.id, { email: credentials.email, role: user.role });

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            institutionId: user.institutionId,
          };
        } catch (error) {
          logError('Auth error', error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const userWithRole = user as { role: string; institutionId?: string | null };
        token.role = userWithRole.role;
        token.institutionId = userWithRole.institutionId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id && token.role) {
        session.user.id = String(token.id);
        session.user.role = String(token.role);
        if (token.institutionId !== undefined) {
          session.user.institutionId = token.institutionId ? String(token.institutionId) : null;
        }
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
