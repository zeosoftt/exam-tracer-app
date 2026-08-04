/**
 * Prisma Client Singleton
 * Prevents multiple instances in development; serverless'ta connection pool için tek instance.
 *
 * Vercel/Supabase yavaşlık için: DATABASE_URL olarak pooler kullanın (port 6543) ve
 * query params ekleyin: ?pgbouncer=true&connection_limit=1
 * Böylece "too many connections" ve yavaş istekler azalır.
 */

import 'server-only';

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
