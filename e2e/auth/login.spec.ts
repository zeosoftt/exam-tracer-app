import { test, expect } from '@playwright/test';
import {
  E2E_CREDENTIALS,
  fillLoginForm,
  gotoLogin,
  loginViaUi,
  logoutViaUi,
  submitLogin,
} from '../helpers/auth';
import { isE2eDbReady, readE2eDbState } from '../helpers/db';

test.describe('Login page UI', () => {
  test('shows form, links and remember-me', async ({ page }) => {
    await gotoLogin(page);

    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByLabel('Beni hatırla (bu cihazda daha uzun oturum)')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Şifremi Unuttum' })).toHaveAttribute(
      'href',
      '/auth/forgot-password',
    );
    await expect(page.getByRole('link', { name: 'Ücretsiz kayıt olun' })).toHaveAttribute(
      'href',
      '/onboarding',
    );
    await expect(page.getByRole('link', { name: 'Ana Sayfaya Dön' })).toHaveAttribute('href', '/');
  });

  test('shows verified success banner', async ({ page }) => {
    await gotoLogin(page, '?verified=1');
    await expect(page.getByText('E-posta adresiniz doğrulandı')).toBeVisible();
  });

  test('shows session expired banner', async ({ page }) => {
    await gotoLogin(page, '?expired=1');
    await expect(page.getByText('Oturumunuz sona erdi')).toBeVisible();
  });

  test('validates empty password on submit', async ({ page }) => {
    await gotoLogin(page);
    await page.locator('#email').fill('user@example.com');
    await submitLogin(page);
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('blocks malformed email via browser validation', async ({ page }) => {
    await gotoLogin(page);
    await page.locator('#email').fill('not-an-email');
    await page.locator('#password').fill('secret');
    await submitLogin(page);
    const isInvalid = await page.locator('#email').evaluate(
      (el) => !(el as HTMLInputElement).validity.valid,
    );
    expect(isInvalid).toBe(true);
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});

test.describe('Login flow (database)', () => {
  test.beforeEach(({ page: _page }, testInfo) => {
    test.skip(!isE2eDbReady(), readE2eDbState().reason ?? 'DB not ready');
  });

  test('redirects unauthenticated user from dashboard to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await gotoLogin(page);
    await fillLoginForm(page, {
      email: E2E_CREDENTIALS.email,
      password: 'WrongPassword999!',
    });
    await submitLogin(page);

    await expect(page.getByText('E-posta veya şifre hatalı')).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('logs in successfully and reaches dashboard', async ({ page }) => {
    await loginViaUi(page);

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('E2E')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Konular' })).toBeVisible();
  });

  test('logs out and returns to login', async ({ page }) => {
    await loginViaUi(page);
    await logoutViaUi(page);
    await expect(page.getByRole('heading', { name: 'Hoş Geldiniz' })).toBeVisible();
  });

  test('respects safe callbackUrl after login', async ({ page }) => {
    await gotoLogin(page, '?callbackUrl=%2Fdashboard%2Fsettings');
    await fillLoginForm(page, E2E_CREDENTIALS);
    await submitLogin(page);
    await page.waitForURL(/\/dashboard\/settings/, { timeout: 20_000 });
    await expect(page.getByText('Ayarlar', { exact: true })).toBeVisible();
  });

  test('ignores unsafe external callbackUrl', async ({ page }) => {
    await gotoLogin(page, '?callbackUrl=https%3A%2F%2Fevil.example%2Fsteal');
    await fillLoginForm(page, E2E_CREDENTIALS);
    await submitLogin(page);
    await page.waitForURL(/\/dashboard(\/)?$/, { timeout: 20_000 });
  });
});
