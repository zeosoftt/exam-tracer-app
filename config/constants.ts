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

/**
 * Süre ifadesini saniyeye çevirir.
 * - Pozitif tamsayı: saniye (örn. 3600)
 * - Sonek: d (gün), h (saat), m (dakika), s (saniye), örn. 7d, 12h, 30m
 */
export function parseDurationToSeconds(raw: string, fallbackSeconds: number): number {
  const s = String(raw).trim().toLowerCase();
  if (!s) return fallbackSeconds;

  const asInt = /^(\d+)$/.exec(s);
  if (asInt) {
    const n = parseInt(asInt[1], 10);
    if (!Number.isFinite(n) || n <= 0) return fallbackSeconds;
    const cap = 365 * 24 * 60 * 60;
    return Math.min(n, cap);
  }

  const m = /^(\d+)\s*([dhms])$/.exec(s);
  if (!m) return fallbackSeconds;
  const n = parseInt(m[1], 10);
  if (!Number.isFinite(n) || n <= 0) return fallbackSeconds;
  const mult = m[2] === 'd' ? 86400 : m[2] === 'h' ? 3600 : m[2] === 'm' ? 60 : 1;
  const sec = n * mult;
  const max = 400 * 24 * 60 * 60;
  if (!Number.isFinite(sec) || sec <= 0) return fallbackSeconds;
  return Math.min(sec, max);
}

export const RATE_LIMIT = {
  WINDOW_MS: getEnvInt('RATE_LIMIT_WINDOW_MS', '900000'), // 15 minutes
  MAX_REQUESTS: getEnvInt('RATE_LIMIT_MAX_REQUESTS', '100'),
  LOGIN_MAX_REQUESTS: 5,
  LOGIN_WINDOW_MS: 900000, // 15 minutes
} as const;

export const BCRYPT_ROUNDS = getEnvInt('BCRYPT_ROUNDS', '12');

export const JWT_CONFIG = {
  /** Ayrı JWT API’leri için; NextAuth’ta doğrudan kullanılmıyor */
  EXPIRES_IN: getEnvString('JWT_EXPIRES_IN', '30d'),
  /** “Beni hatırla” kapalıyken oturum süresi */
  SESSION_EXPIRES_IN: getEnvString('SESSION_EXPIRES_IN', '7d'),
  /** “Beni hatırla” açıkken üst süre (örn. 30d); çerez maxAge = max(ikisi) */
  SESSION_REMEMBER_EXPIRES_IN: getEnvString('SESSION_REMEMBER_EXPIRES_IN', '30d'),
} as const;

const DEFAULT_SESSION_SECONDS = 30 * 24 * 60 * 60;

/** Kısa oturum (beni hatırla kapalı), saniye */
export const NEXTAUTH_SESSION_SHORT_SECONDS = parseDurationToSeconds(
  JWT_CONFIG.SESSION_EXPIRES_IN,
  DEFAULT_SESSION_SECONDS,
);

/** Uzun oturum (beni hatırla açık), saniye — kısa süreden kısa olamaz */
export const NEXTAUTH_SESSION_REMEMBER_SECONDS = Math.max(
  NEXTAUTH_SESSION_SHORT_SECONDS,
  parseDurationToSeconds(JWT_CONFIG.SESSION_REMEMBER_EXPIRES_IN, DEFAULT_SESSION_SECONDS),
);

/** JWT + session çerezi üst sınırı (ikisinin uzunu) */
export const NEXTAUTH_COOKIE_MAX_AGE_SECONDS = Math.max(
  NEXTAUTH_SESSION_SHORT_SECONDS,
  NEXTAUTH_SESSION_REMEMBER_SECONDS,
);

/** @deprecated Aynı anlama gelir: NEXTAUTH_COOKIE_MAX_AGE_SECONDS */
export const NEXTAUTH_SESSION_MAX_AGE_SECONDS = NEXTAUTH_COOKIE_MAX_AGE_SECONDS;

/** E-posta doğrulama token süresi (saat), 1–168 */
export const EMAIL_VERIFICATION_TTL_HOURS = Math.min(
  168,
  Math.max(1, getEnvInt('EMAIL_VERIFICATION_TTL_HOURS', '24')),
);

/** Şifre sıfırlama token süresi (dakika), 15–1440 */
export const PASSWORD_RESET_TTL_MINUTES = Math.min(
  1440,
  Math.max(15, getEnvInt('PASSWORD_RESET_TTL_MINUTES', '60')),
);

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
  /** Üst akış (ör. e-posta sağlayıcısı) geçersiz yanıt */
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Yetkisiz erişim',
  FORBIDDEN: 'Bu işlemi gerçekleştirmek için izniniz yok',
  NOT_FOUND: 'Kaynak bulunamadı',
  VALIDATION_ERROR: 'Validation failed',
  INTERNAL_ERROR: 'Dahili bir hata oluştu',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'E-posta zaten mevcut',
  INVALID_TOKEN: 'Invalid or expired token',
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',
  DATABASE_UNAVAILABLE:
    'Hizmetimize şu anda ulaşılamıyor. Lütfen birkaç dakika sonra tekrar deneyin.',
} as const;

/** Giriş ve benzeri ekranlarda servis kesintisi (kullanıcı hatası değil) */
export const SERVICE_UNAVAILABLE_COPY = {
  badge: 'Geçici erişim sorunu',
  title: 'Şu an giriş yapılamıyor',
  description:
    'Sunucularımıza geçici olarak bağlanılamıyor. Bu durum genellikle kısa sürer. Bir süre sonra tekrar deneyebilir veya aşağıdaki düğmeyle sayfayı yenileyebilirsiniz. Sorun devam ederse destek ekibine başvurun.',
  retryLabel: 'Sayfayı yenile',
} as const;

/** NextAuth credentials: authorize içinde throw edilir; client `result.error` ile eşleşir */
export const AUTH_ERROR_CODES = {
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  DATABASE_UNAVAILABLE: 'DATABASE_UNAVAILABLE',
} as const;

/** Ücretli plan (Pro) satın alma — Shopier ürün sayfası */
export const SHOPIER_CHECKOUT_URL = 'https://www.shopier.com/zeosoft/47039117' as const;
