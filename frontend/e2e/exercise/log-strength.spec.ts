import { test, expect } from '@playwright/test';

test.describe('Strength Exercise Logging', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/exercise');
    await expect(page.locator('h1')).toContainText('Exercise Log');
    await page.click('button:has-text("Add Exercise")');
  });

  test('shows strength-specific fields when STRENGTH is selected', async ({ page }) => {
    await page.selectOption('select', 'STRENGTH');
    await expect(page.locator('label:has-text("Sets")')).toBeVisible();
    await expect(page.locator('label:has-text("Reps")')).toBeVisible();
    await expect(page.locator('label:has-text("Weight (kg)")')).toBeVisible();
    await expect(page.locator('label:has-text("Distance (km)")')).not.toBeVisible();
  });

  test('logs a strength exercise', async ({ page }) => {
    await page.selectOption('select', 'STRENGTH');
    await page.fill('input[placeholder="e.g., Running, Bench Press"]', 'Bench Press');
    await page.locator('label:has-text("Duration (min)")').locator('..').locator('input').fill('20');
    await page.locator('label:has-text("Sets")').locator('..').locator('input').fill('3');
    await page.locator('label:has-text("Reps")').locator('..').locator('input').fill('10');
    await page.locator('label:has-text("Weight (kg)")').locator('..').locator('input').fill('60');

    await page.click('button:has-text("Log Exercise")');

    await expect(page.locator('text=Bench Press')).toBeVisible();
  });

  test('cancels without saving', async ({ page }) => {
    await page.fill('input[placeholder="e.g., Running, Bench Press"]', 'Should Not Save');
    await page.click('button:has-text("Cancel")');
    await expect(page.locator('button:has-text("Add Exercise")')).toBeVisible();
    await expect(page.locator('text=Should Not Save')).not.toBeVisible();
  });
});
