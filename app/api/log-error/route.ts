/**
 * Client Error Logging API
 * Receives client-side errors and logs them server-side
 */

import { NextRequest, NextResponse } from 'next/server';
import { asyncHandler } from '@/lib/errors/errorHandler';
import { jsonOk } from '@/lib/api/responses';
import { validate } from '@/lib/validation/validate';
import { clientLogErrorSchema } from '@/lib/validation/schemas';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { logError } from '@/lib/logger';
import { HTTP_STATUS } from '@/config/constants';

const limiter = rateLimit(20, 60_000);

async function logErrorHandler(req: NextRequest): Promise<NextResponse> {
  const limited = limiter(req);
  if (limited) return limited;

  const body = await req.json();
  const validated = validate(clientLogErrorSchema, body);

  logError('Client-side error', new Error(validated.message), {
    stack: validated.stack?.slice(0, 2000),
    componentStack: validated.componentStack?.slice(0, 2000),
  });

  return jsonOk({ logged: true }, HTTP_STATUS.OK);
}

export const POST = asyncHandler(logErrorHandler);
