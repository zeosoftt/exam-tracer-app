/**
 * Rate limiting — Upstash Redis (REST) varsa dağıtık, yoksa bellek içi.
 *
 * Serverless/edge'de bellek içi sayaç instance başınadır; üretimde gerçek koruma için
 * UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN tanımlayın. Her limiter async'tir ve
 * limit aşımında 429 + Retry-After döner.
 */

import { NextRequest, NextResponse } from 'next/server';
import { RATE_LIMIT, ERROR_MESSAGES } from '@/config/constants';

const TOO_MANY_REQUESTS = 429;
const SWEEP_INTERVAL_MS = 60_000;

type RateHit = { count: number; resetTime: number };

const rateLimitStore = new Map<string, RateHit>();
let lastSweepAt = 0;

export type RateLimiter = (req: NextRequest) => Promise<NextResponse | null>;

function getIdentifier(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || 'unknown';
}

/** Modül düzeyinde setInterval yerine erişim anında seyrek temizlik (edge runtime dostu). */
function sweepExpired(now: number): void {
  if (now - lastSweepAt < SWEEP_INTERVAL_MS) return;
  lastSweepAt = now;
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) rateLimitStore.delete(key);
  }
}

async function upstashIncrement(key: string, windowMs: number): Promise<RateHit | null> {
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
        ['PTTL', redisKey],
      ]),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ result?: number }>;
    const count = data[0]?.result ?? 1;
    const pttl = data[2]?.result;
    const resetTime = Date.now() + (typeof pttl === 'number' && pttl > 0 ? pttl : windowMs);
    return { count, resetTime };
  } catch {
    return null;
  }
}

function memoryIncrement(key: string, windowMs: number): RateHit {
  const now = Date.now();
  sweepExpired(now);
  const record = rateLimitStore.get(key);
  if (!record || now > record.resetTime) {
    const fresh = { count: 1, resetTime: now + windowMs };
    rateLimitStore.set(key, fresh);
    return fresh;
  }
  record.count += 1;
  return { count: record.count, resetTime: record.resetTime };
}

function rateLimitResponse(maxRequests: number, resetTime: number): NextResponse {
  const retryAfterSec = Math.max(1, Math.ceil((resetTime - Date.now()) / 1000));
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
      status: TOO_MANY_REQUESTS,
      headers: {
        'Retry-After': String(retryAfterSec),
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
): RateLimiter {
  return async (req: NextRequest): Promise<NextResponse | null> => {
    const key = `${getIdentifier(req)}:${maxRequests}:${windowMs}`;
    const hit = (await upstashIncrement(key, windowMs)) ?? memoryIncrement(key, windowMs);
    return hit.count > maxRequests ? rateLimitResponse(maxRequests, hit.resetTime) : null;
  };
}

/** Geriye dönük uyumluluk — `rateLimit(max, window)(req)` ile aynı. */
export async function rateLimitAsync(
  req: NextRequest,
  maxRequests: number,
  windowMs: number,
): Promise<NextResponse | null> {
  return rateLimit(maxRequests, windowMs)(req);
}
