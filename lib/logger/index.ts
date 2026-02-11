/**
 * Structured Logging with Winston
 * Server-side only - Never import in client components
 * No console.log in production
 * On Vercel/serverless: console only (no file system writes)
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logLevel = process.env.LOG_LEVEL || 'info';
const isDevelopment = process.env.NODE_ENV === 'development';
const isServerless = typeof process.env.VERCEL !== 'undefined' || typeof process.env.AWS_LAMBDA_FUNCTION_NAME !== 'undefined';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format for development
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

// Transports: always console; add file transports only when not serverless and logs dir is writable
const transports: winston.transport[] = [
  new winston.transports.Console({
    format: isDevelopment ? consoleFormat : logFormat,
  }),
];

if (!isServerless) {
  try {
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    transports.push(
      new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        maxsize: 5242880,
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
        maxsize: 5242880,
        maxFiles: 5,
      })
    );
  } catch {
    // Read-only FS or permission error: console only
  }
}

const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  defaultMeta: { service: 'exam-tracker' },
  transports,
  exceptionHandlers: isServerless ? [new winston.transports.Console()] : undefined,
  rejectionHandlers: isServerless ? [new winston.transports.Console()] : undefined,
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
