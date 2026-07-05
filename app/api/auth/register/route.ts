/**
 * User Registration Endpoint
 * POST /api/auth/register
 */

import { NextRequest } from 'next/server';
import { validate } from '@/lib/validation/validate';
import { registerSchema } from '@/lib/validation/schemas';
import { registerUser } from '@/lib/auth/registerService';
import { authCreated } from '@/lib/auth/responses';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { RATE_LIMIT } from '@/config/constants';
import { wrapAuthPostHandler } from '@/lib/auth/authRouteHelpers';

const limiter = rateLimit(RATE_LIMIT.LOGIN_MAX_REQUESTS, RATE_LIMIT.LOGIN_WINDOW_MS);

async function registerHandler(req: NextRequest) {
  const input = validate(registerSchema, await req.json());
  const user = await registerUser(input);
  return authCreated({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  });
}

export const POST = wrapAuthPostHandler(registerHandler, { limiter });
