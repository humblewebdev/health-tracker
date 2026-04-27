import { test, expect } from '@playwright/test';

test.describe('Cardio Exercise Logging', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/exercise');
    await expect(page.locator('h1')).toContainText('Exercise Log');
    await page.click('button:has-text("Add Exercise")');
  });

  test('shows cardio-specific fields when CARDIO is selected', async ({ page }) => {
    await page.selectOption('select', 'CARDIO');
    await expect(page.locator('label:has-text("Distance (km)")')).toBeVisible();
    await expect(page.locator('label:has-text("Avg Heart Rate (bpm)")')).toBeVisible();
    await expect(page.locator('label:has-text("Sets")')).not.toBeVisible();
  });

  test('logs a cardio exercise', async ({ page }) => {
    await page.selectOption('select', 'CARDIO');
    await page.fill('input[placeholder="e.g., Running, Bench Press"]', 'Morning Run');
    await page.locator('label:has-text("Duration (min)")').locator('..').locator('input').fill('30');
    await page.locator('label:has-text("Distance (km)")').locator('..').locator('input').fill('5.0');
    await page.locator('label:has-text("Calories Burned")').locator('..').locator('input').fill('300');
    await page.selectOption('select:last-of-type', 'MODERATE');

    await page.click('button:has-text("Log Exercise")');

    await expect(page.locator('text=Morning Run')).toBeVisible();
  });
});
