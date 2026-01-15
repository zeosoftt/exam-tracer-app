/**
 * Rate Limiting Middleware
 * Prevents abuse and ensures fair usage
 */

import { NextRequest, NextResponse } from 'next/server';
import { RATE_LIMIT } from '@/config/constants';
import { HTTP_STATUS, ERROR_MESSAGES } from '@/config/constants';

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  maxRequests: number = RATE_LIMIT.MAX_REQUESTS,
  windowMs: number = RATE_LIMIT.WINDOW_MS
) {
  return (req: NextRequest): NextResponse | null => {
    const identifier = getIdentifier(req);
    const now = Date.now();
    const record = rateLimitStore.get(identifier);

    // Clean up old records
    if (record && now > record.resetTime) {
      rateLimitStore.delete(identifier);
    }

    const currentRecord = rateLimitStore.get(identifier);

    if (!currentRecord) {
      // First request
      rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      return null; // Allow request
    }

    if (currentRecord.count >= maxRequests) {
      // Rate limit exceeded
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
            'X-RateLimit-Reset': new Date(currentRecord.resetTime).toISOString(),
          },
        }
      );
    }

    // Increment count
    currentRecord.count++;
    rateLimitStore.set(identifier, currentRecord);

    return null; // Allow request
  };
}

function getIdentifier(req: NextRequest): string {
  // Use IP address or user ID if authenticated
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
  return ip;
}

// Cleanup old records periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute
