import { test as setup, expect } from '@playwright/test';
import { testUser } from './test-data';

const AUTH_STATE_FILE = 'e2e/fixtures/.auth-state.json';

setup('create test user and save auth state', async ({ page }) => {
  // Try logging in first — user may already exist from a previous run
  await page.goto('/login');
  await page.fill('input#email', testUser.email);
  await page.fill('input#password', testUser.password);
  await page.click('button[type="submit"]');

  const loginSuccess = await page.waitForURL('/dashboard', { timeout: 5000 }).then(() => true).catch(() => false);

  if (!loginSuccess) {
    // User doesn't exist yet — register
    await page.goto('/register');
    await page.fill('input#firstName', testUser.firstName);
    await page.fill('input#lastName', testUser.lastName);
    await page.fill('input#email', testUser.email);
    await page.fill('input#password', testUser.password);
    await page.fill('input#confirmPassword', testUser.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  }

  await page.context().storageState({ path: AUTH_STATE_FILE });
});
