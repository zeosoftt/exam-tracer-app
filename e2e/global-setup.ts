import { execSync } from 'node:child_process';
import { writeE2eDbState } from './helpers/db';

export default async function globalSetup() {
  if (process.env.E2E_SKIP_DB === '1') {
    writeE2eDbState({ ready: false, reason: 'E2E_SKIP_DB=1' });
    return;
  }

  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    writeE2eDbState({ ready: false, reason: 'DATABASE_URL missing' });
    return;
  }

  try {
    execSync('npx prisma db push --skip-generate --accept-data-loss', {
      stdio: 'inherit',
      env: process.env,
    });
    execSync('npx tsx scripts/seed-e2e-user.ts', {
      stdio: 'inherit',
      env: process.env,
    });
    writeE2eDbState({ ready: true });
    console.log('[e2e] Database ready with test user');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    writeE2eDbState({ ready: false, reason: message });
    if (process.env.CI) {
      throw error;
    }
    console.warn('[e2e] DB setup skipped — DB-dependent tests will be skipped:', message);
  }
}
