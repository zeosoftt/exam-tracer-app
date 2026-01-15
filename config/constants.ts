/**
 * Application Constants
 * No magic numbers or strings - all constants defined here
 */

// Type declaration for Node.js process
declare const process: {
  env: Record<string, string | undefined>;
};

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  INSTITUTION_ADMIN: 'INSTITUTION_ADMIN',
  INDIVIDUAL: 'INDIVIDUAL',
  VIEWER: 'VIEWER',
} as const;

export const EXAM_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ARCHIVED: 'ARCHIVED',
} as const;

export const PROGRESS_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  REVIEWED: 'REVIEWED',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 1,
} as const;

export const VALIDATION = {
  EMAIL_MAX_LENGTH: 255,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  CODE_MIN_LENGTH: 2,
  CODE_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 1000,
  NOTES_MAX_LENGTH: 5000,
} as const;

// Environment variable access with type safety
const getEnvInt = (key: string, defaultValue: string): number => {
  if (typeof process !== 'undefined' && process.env) {
    return parseInt(process.env[key] || defaultValue, 10);
  }
  return parseInt(defaultValue, 10);
};

const getEnvString = (key: string, defaultValue: string): string => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  return defaultValue;
};

export const RATE_LIMIT = {
  WINDOW_MS: getEnvInt('RATE_LIMIT_WINDOW_MS', '900000'), // 15 minutes
  MAX_REQUESTS: getEnvInt('RATE_LIMIT_MAX_REQUESTS', '100'),
  LOGIN_MAX_REQUESTS: 5,
  LOGIN_WINDOW_MS: 900000, // 15 minutes
} as const;

export const BCRYPT_ROUNDS = getEnvInt('BCRYPT_ROUNDS', '12');

export const JWT_CONFIG = {
  EXPIRES_IN: getEnvString('JWT_EXPIRES_IN', '7d'),
  SESSION_EXPIRES_IN: getEnvString('SESSION_EXPIRES_IN', '30d'),
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'You do not have permission to perform this action',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation failed',
  INTERNAL_ERROR: 'An internal error occurred',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'Email already exists',
  INVALID_TOKEN: 'Invalid or expired token',
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',
} as const;
