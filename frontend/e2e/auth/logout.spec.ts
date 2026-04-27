import { test, expect } from '@playwright/test';
import { testUser } from '../fixtures/test-data';

test.describe('Logout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input#email', testUser.email);
    await page.fill('input#password', testUser.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('logs out and redirects to login', async ({ page }) => {
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL('/login');
  });

  test('protected routes redirect to login after logout', async ({ page }) => {
    await page.click('button:has-text("Logout")');
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });
});
