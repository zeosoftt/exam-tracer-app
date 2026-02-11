/**
 * Health Check Endpoint
 * GET /api/health
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { logError } from '@/lib/logger';

export async function GET() {
  if (!process.env.DATABASE_URL?.trim()) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: 'DATABASE_URL is not set. Add it in Vercel → Settings → Environment Variables and redeploy.',
      },
      { status: 503 }
    );
  }

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        environment: process.env.NODE_ENV || 'development',
      },
      { status: 200 }
    );
  } catch (error) {
    // Log the error for debugging
    logError('Health check failed - Database connection error', error, {
      endpoint: '/api/health',
      timestamp: new Date().toISOString(),
    });

    // Return detailed error in development, generic in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = error instanceof Error && 'code' in error ? String(error.code) : undefined;

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        environment: process.env.NODE_ENV || 'development',
        ...(isDevelopment && {
          error: {
            message: errorMessage,
            code: errorCode,
            type: error instanceof Error ? error.name : typeof error,
          },
        }),
      },
      { status: 503 }
    );
  }
}
