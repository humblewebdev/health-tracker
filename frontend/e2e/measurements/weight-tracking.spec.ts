import { test, expect } from '@playwright/test';

test.describe('Weight Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/measurements');
    await expect(page.locator('h1')).toContainText('Measurements');
  });

  test('shows weight tab by default', async ({ page }) => {
    await expect(page.locator('button:has-text("Log Weight")')).toBeVisible();
  });

  test('logs a weight measurement', async ({ page }) => {
    // Weight is the default tab — fill the number input (not the date input)
    await page.locator('input[type="number"]').first().fill('75.5');
    await page.click('button:has-text("Log Weight")');
    await expect(page.locator('text=75.5')).toBeVisible();
  });

  test('switches to body composition tab', async ({ page }) => {
    await page.click('button:has-text("Body Composition")');
    await expect(page.locator('button:has-text("Log Body Composition")')).toBeVisible();
    await expect(page.locator('label:has-text("Body Fat (%)")')).toBeVisible();
  });

  test('switches to body measurements tab', async ({ page }) => {
    await page.click('button:has-text("Body Measurements")');
    await expect(page.locator('button:has-text("Log Measurements")')).toBeVisible();
    await expect(page.locator('label:has-text("Waist")')).toBeVisible();
  });
});
