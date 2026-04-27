import { test, expect } from '@playwright/test';
import { testUser } from '../fixtures/test-data';

test.describe('Login', () => {
  test('logs in with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input#email', testUser.email);
    await page.fill('input#password', testUser.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('shows error for wrong password', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input#email', testUser.email);
    await page.fill('input#password', 'WrongPassword1!');
    await page.click('button[type="submit"]');
    await expect(page.locator('.bg-red-100')).toBeVisible();
  });

  test('redirects authenticated users away from login page', async ({ page }) => {
    // Log in first
    await page.goto('/login');
    await page.fill('input#email', testUser.email);
    await page.fill('input#password', testUser.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    // Revisiting /login should redirect back to dashboard
    await page.goto('/login');
    await expect(page).toHaveURL('/dashboard');
  });
});
