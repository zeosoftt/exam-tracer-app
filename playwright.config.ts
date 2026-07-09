import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000';

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 60_000,
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'npm run start',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://ci:ci@localhost:5432/ci',
          NEXTAUTH_SECRET:
            process.env.NEXTAUTH_SECRET ?? 'ci-e2e-secret-minimum-32-characters-long',
          NEXTAUTH_URL: baseURL,
          E2E_TEST_EMAIL: process.env.E2E_TEST_EMAIL ?? 'e2e@test.local',
          E2E_TEST_PASSWORD: process.env.E2E_TEST_PASSWORD ?? 'E2eTest123!',
        },
      },
});
