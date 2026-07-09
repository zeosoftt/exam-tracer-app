/**
 * Structured Logging with Winston
 * Server-side only - Never import in client components
 * In all environments (including Vercel/serverless), we log to console only.
 * Vercel and most platforms already capture console output as structured logs.
 */

import winston from 'winston';
import { captureException } from '@/lib/sentry/capture';

const logLevel = process.env.LOG_LEVEL || 'info';
const isDevelopment = process.env.NODE_ENV === 'development';

// Base JSON format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Human-readable console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Single console transport (works everywhere, including Vercel)
const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  defaultMeta: { service: 'thegoallab' },
  transports: [
    new winston.transports.Console({
      format: isDevelopment ? consoleFormat : logFormat,
    }),
  ],
});

// Logging helper functions
export const logInfo = (message: string, meta?: Record<string, unknown>) => {
  if (typeof window === 'undefined') {
    logger.info(message, meta);
  }
};

export const logWarn = (message: string, meta?: Record<string, unknown>) => {
  if (typeof window === 'undefined') {
    logger.warn(message, meta);
  }
};

export const logError = (message: string, error?: Error | unknown, meta?: Record<string, unknown>) => {
  if (typeof window === 'undefined') {
    const errorMeta = {
      ...meta,
      ...(error instanceof Error
        ? {
            error: {
              message: error.message,
              stack: error.stack,
              name: error.name,
            },
          }
        : { error }),
    };
    logger.error(message, errorMeta);
    if (error instanceof Error) {
      captureException(error, { logMessage: message, ...meta });
    } else if (error !== undefined) {
      captureException(new Error(String(error)), { logMessage: message, ...meta });
    }
  }
};

export const logAuth = (action: string, userId?: string, meta?: Record<string, unknown>) => {
  if (typeof window === 'undefined') {
    logger.info(`Auth: ${action}`, { userId, ...meta });
  }
};

export const logApi = (method: string, path: string, statusCode: number, duration?: number, meta?: Record<string, unknown>) => {
  if (typeof window === 'undefined') {
    logger.info(`API: ${method} ${path}`, { statusCode, duration, ...meta });
  }
};

export default logger;
