import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('shows quick action links', async ({ page }) => {
    await expect(page.locator('h2', { hasText: 'Quick Actions' })).toBeVisible();
    await expect(page.locator('a, [role="link"]').filter({ hasText: 'Log Food' })).toBeVisible();
    await expect(page.locator('a, [role="link"]').filter({ hasText: 'Log Exercise' })).toBeVisible();
    await expect(page.locator('a, [role="link"]').filter({ hasText: 'Measurements' })).toBeVisible();
  });

  test('quick action Log Food navigates to nutrition page', async ({ page }) => {
    await page.locator('a, [role="link"]').filter({ hasText: 'Log Food' }).click();
    await expect(page).toHaveURL('/nutrition');
  });

  test('shows trends section', async ({ page }) => {
    await expect(page.locator('text=Trends')).toBeVisible();
    await expect(page.locator('button:has-text("7 days"), button:has-text("7 Days")')).toBeVisible();
  });
});
