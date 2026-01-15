/**
 * Centralized Error Handler
 * Never expose stack traces to clients
 */

import { NextResponse } from 'next/server';
import { AppError } from './AppError';
import { HTTP_STATUS, ERROR_MESSAGES } from '@/config/constants';
import { logError } from '@/lib/logger';

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
  // Log the error
  logError('Error occurred', error);

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

export function asyncHandler(
  fn: (req: Request, ...args: unknown[]) => Promise<NextResponse>
) {
  return async (req: Request, ...args: unknown[]): Promise<NextResponse> => {
    try {
      return await fn(req, ...args);
    } catch (error) {
      return handleError(error);
    }
  };
}
