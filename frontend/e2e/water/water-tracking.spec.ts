import { test, expect } from '@playwright/test';

test.describe('Water Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/water');
    await expect(page.locator('h1')).toContainText('Water Intake');
  });

  test('logs water with a quick-add button', async ({ page }) => {
    await page.click('button:has-text("250 ml (Cup)")');
    // Entry should appear in today's log
    await expect(page.locator('text=250 ml')).toBeVisible();
  });

  test('logs a custom water amount', async ({ page }) => {
    await page.fill('input[placeholder="Amount in ml"]', '350');
    await page.click('button:has-text("Add")');
    await expect(page.locator('text=350 ml')).toBeVisible();
  });

  test('shows today\'s progress section', async ({ page }) => {
    await expect(page.locator('h2', { hasText: "Today's Progress" })).toBeVisible();
    await expect(page.locator('text=Goal')).toBeVisible();
  });

  test('shows quick add options', async ({ page }) => {
    await expect(page.locator('button:has-text("100 ml (Small glass)")')).toBeVisible();
    await expect(page.locator('button:has-text("500 ml (Bottle)")')).toBeVisible();
    await expect(page.locator('button:has-text("750 ml (Large bottle)")')).toBeVisible();
  });
});
