import type { Page } from '@playwright/test';

export const E2E_CREDENTIALS = {
  email: process.env.E2E_TEST_EMAIL ?? 'e2e@test.local',
  password: process.env.E2E_TEST_PASSWORD ?? 'E2eTest123!',
};

export async function gotoLogin(page: Page, query = ''): Promise<void> {
  await page.goto(`/auth/login${query}`);
  await page.getByRole('heading', { name: 'Hoş Geldiniz' }).waitFor();
}

export async function fillLoginForm(
  page: Page,
  credentials: { email: string; password: string },
): Promise<void> {
  await page.locator('#email').fill(credentials.email);
  await page.locator('#password').fill(credentials.password);
}

export async function submitLogin(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Giriş Yap' }).click();
}

export async function loginViaUi(
  page: Page,
  credentials = E2E_CREDENTIALS,
): Promise<void> {
  await gotoLogin(page);
  await fillLoginForm(page, credentials);
  await submitLogin(page);
  await page.waitForURL(/\/dashboard(\/|$|\?)/, { timeout: 20_000 });
}

export async function logoutViaUi(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Çıkış' }).click();
  await page.waitForURL(/\/auth\/login/, { timeout: 15_000 });
}
