/**
 * Structured Logging with Winston
 * Server-side only - Never import in client components
 * No console.log in production
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';

const logLevel = process.env.LOG_LEVEL || 'info';
const isDevelopment = process.env.NODE_ENV === 'development';

// Ensure logs directory exists (server-side only)
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

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

// Create logger instance
const logger = winston.createLogger({
  level: logLevel,
  format: logFormat,
  defaultMeta: { service: 'exam-tracker' },
  transports: [
    // Write all logs to console in development
    new winston.transports.Console({
      format: isDevelopment ? consoleFormat : logFormat,
    }),
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'exceptions.log'),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'rejections.log'),
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
