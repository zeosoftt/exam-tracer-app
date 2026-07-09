/**
 * Rate limiting — bellek içi varsayılan; Upstash REST API ile dağıtık mod (opsiyonel).
 */

import { NextRequest, NextResponse } from 'next/server';
import { RATE_LIMIT, HTTP_STATUS, ERROR_MESSAGES } from '@/config/constants';

type RateRecord = { count: number; resetTime: number };

const rateLimitStore = new Map<string, RateRecord>();

function getIdentifier(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || 'unknown';
}

async function upstashIncrement(key: string, windowMs: number): Promise<{ count: number; allowed: boolean } | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;

  const windowSec = Math.ceil(windowMs / 1000);
  const redisKey = `ratelimit:${key}:${windowSec}`;

  try {
    const res = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([
        ['INCR', redisKey],
        ['EXPIRE', redisKey, windowSec, 'NX'],
      ]),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: number }[];
    const count = data[0]?.result ?? 1;
    return { count, allowed: true };
  } catch {
    return null;
  }
}

function memoryIncrement(key: string, windowMs: number): { count: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { count: 1 };
  }
  record.count += 1;
  rateLimitStore.set(key, record);
  return { count: record.count };
}

function rateLimitResponse(maxRequests: number, resetTime: number): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
        code: 'RATE_LIMIT_EXCEEDED',
      },
      timestamp: new Date().toISOString(),
    },
    {
      status: HTTP_STATUS.BAD_REQUEST,
      headers: {
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(resetTime).toISOString(),
      },
    },
  );
}

export function rateLimit(
  maxRequests: number = RATE_LIMIT.MAX_REQUESTS,
  windowMs: number = RATE_LIMIT.WINDOW_MS,
) {
  return (req: NextRequest): NextResponse | null => {
    const identifier = getIdentifier(req);
    const key = `${identifier}:${maxRequests}:${windowMs}`;
    const memory = memoryIncrement(key, windowMs);
    if (memory.count > maxRequests) {
      const record = rateLimitStore.get(key);
      return rateLimitResponse(maxRequests, record?.resetTime ?? Date.now() + windowMs);
    }
    return null;
  };
}

/** Async rate limit — Upstash varsa önce onu dener. */
export async function rateLimitAsync(
  req: NextRequest,
  maxRequests: number,
  windowMs: number,
): Promise<NextResponse | null> {
  const identifier = getIdentifier(req);
  const key = `${identifier}:${maxRequests}:${windowMs}`;

  const upstash = await upstashIncrement(key, windowMs);
  if (upstash) {
    if (upstash.count > maxRequests) {
      return rateLimitResponse(maxRequests, Date.now() + windowMs);
    }
    return null;
  }

  return rateLimit(maxRequests, windowMs)(req);
}

setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);
