/**
 * Sentry ortam değişkenlerini doğrular (deploy öncesi).
 * Kullanım: node scripts/verify-sentry-env.js
 */

const dsn = process.env.SENTRY_DSN?.trim() || process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
const publicDsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();

if (!dsn) {
  console.log('Sentry: DSN tanımlı değil — izleme devre dışı (local/CI için normal).');
  process.exit(0);
}

console.log('Sentry: DSN tanımlı ✓');
if (!publicDsn) {
  console.warn(
    'Sentry: NEXT_PUBLIC_SENTRY_DSN eksik — tarayıcı hataları Sentry\'e gitmeyebilir. Genelde SENTRY_DSN ile aynı değeri verin.',
  );
}

if (process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT) {
  console.log('Sentry: kaynak haritası yükleme yapılandırması tam ✓');
} else {
  console.log(
    'Sentry: SENTRY_ORG / SENTRY_PROJECT / SENTRY_AUTH_TOKEN eksik — kaynak haritası yüklenmez (stack trace minified kalır).',
  );
}

process.exit(0);
