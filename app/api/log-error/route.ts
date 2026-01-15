/**
 * Client Error Logging API
 * Receives client-side errors and logs them server-side
 */

import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler, handleError } from '@/lib/errors/errorHandler';
import { logError } from '@/lib/logger';
import { HTTP_STATUS } from '@/config/constants';

async function logErrorHandler(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();

    // Log the error server-side
    logError('Client-side error', new Error(body.message || 'Unknown error'), {
      stack: body.stack,
      componentStack: body.componentStack,
    });

    return NextResponse.json(
      {
        success: true,
      },
      { status: HTTP_STATUS.OK }
    );
  } catch (error) {
    // Don't throw error for logging failures
    return NextResponse.json(
      {
        success: false,
      },
      { status: HTTP_STATUS.OK }
    );
  }
}

export const POST = asyncHandler(logErrorHandler);
