/**
 * Centralized Error Handler
 * Never expose stack traces to clients
 */

import { NextRequest, NextResponse } from 'next/server';
import { AppError } from './AppError';
import { HTTP_STATUS, ERROR_MESSAGES } from '@/config/constants';
import { logError } from '@/lib/logger';
import { captureException } from '@/lib/sentry/capture';

/** Prisma connection error codes → return 503 (service unavailable) */
const PRISMA_CONNECTION_CODES = new Set([
  'P1001', // Can't reach database server
  'P1000', // Authentication failed
  'P1002', // Connection timeout
  'P1017', // Server closed connection
  'P1034', // Query engine process exited
]);

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

export function handleError(error: unknown): NextResponse<ErrorResponse> {
  // Log the error with more details
  if (error instanceof Error) {
    logError('Error occurred', error, {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  } else {
    logError('Unknown error occurred', new Error(String(error)), {
      errorType: typeof error,
      errorValue: String(error),
    });
  }

  // Handle known AppError instances
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode }
    );
  }

  // Handle Prisma database connection errors → 503 (do not expose details)
  if (error && typeof error === 'object' && 'code' in error && typeof (error as { code: string }).code === 'string') {
    const code = (error as { code: string }).code;
    if (PRISMA_CONNECTION_CODES.has(code)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: ERROR_MESSAGES.DATABASE_UNAVAILABLE,
            code: 'DATABASE_UNAVAILABLE',
          },
          timestamp: new Date().toISOString(),
        },
        { status: HTTP_STATUS.SERVICE_UNAVAILABLE }
      );
    }
  }

  // Handle validation errors (Zod)
  if (error && typeof error === 'object' && 'issues' in error) {
    const zodError = error as { issues: Array<{ path: string[]; message: string }> };
    return NextResponse.json(
      {
        success: false,
        error: {
          message: ERROR_MESSAGES.VALIDATION_ERROR,
          code: 'VALIDATION_ERROR',
          details: zodError.issues.reduce(
            (acc, issue) => {
              acc[issue.path.join('.')] = issue.message;
              return acc;
            },
            {} as Record<string, string>
          ),
        },
        timestamp: new Date().toISOString(),
      },
      { status: HTTP_STATUS.UNPROCESSABLE_ENTITY }
    );
  }

  // Handle unknown errors - never expose stack trace
  if (!(error instanceof AppError)) {
    captureException(error instanceof Error ? error : new Error(String(error)));
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        message: ERROR_MESSAGES.INTERNAL_ERROR,
        code: 'INTERNAL_ERROR',
      },
      timestamp: new Date().toISOString(),
    },
    { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
  );
}

export function asyncHandler<T extends unknown[] = unknown[]>(
  fn: (req: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      return await fn(req, ...args);
    } catch (error) {
      return handleError(error);
    }
  };
}
