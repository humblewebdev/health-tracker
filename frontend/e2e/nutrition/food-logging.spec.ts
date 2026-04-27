import { test, expect } from '@playwright/test';

test.describe('Food Logging', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/nutrition');
    await expect(page.locator('h1')).toContainText('Food Log');
  });

  test('logs a breakfast food item', async ({ page }) => {
    // Each meal section has its own "Add Food" button; click the Breakfast one
    await page.locator('section', { hasText: 'Breakfast' }).getByRole('button', { name: 'Add Food' }).click();

    await expect(page.locator('h2', { hasText: 'Add Food' })).toBeVisible();

    await page.fill('input[name="foodName"]', 'Scrambled Eggs');
    await page.fill('input[name="calories"]', '180');
    await page.fill('input[name="protein"]', '14');
    await page.fill('input[name="carbs"]', '2');
    await page.fill('input[name="fats"]', '12');

    await page.click('button:has-text("Add Food")');

    // Modal should close and entry should appear on page
    await expect(page.locator('h2', { hasText: 'Add Food' })).not.toBeVisible();
    await expect(page.locator('text=Scrambled Eggs')).toBeVisible();
  });

  test('requires food name before submitting', async ({ page }) => {
    await page.locator('section', { hasText: 'Breakfast' }).getByRole('button', { name: 'Add Food' }).click();
    await page.fill('input[name="calories"]', '100');
    await page.click('button:has-text("Add Food")');
    // Browser native required validation or our custom error keeps the modal open
    await expect(page.locator('h2', { hasText: 'Add Food' })).toBeVisible();
  });

  test('cancels modal without saving', async ({ page }) => {
    await page.locator('section', { hasText: 'Breakfast' }).getByRole('button', { name: 'Add Food' }).click();
    await page.fill('input[name="foodName"]', 'Should Not Save');
    await page.click('button:has-text("Cancel")');
    await expect(page.locator('h2', { hasText: 'Add Food' })).not.toBeVisible();
    await expect(page.locator('text=Should Not Save')).not.toBeVisible();
  });

  test('navigates between dates', async ({ page }) => {
    const initial = await page.locator('button:has-text("Previous")').isVisible();
    expect(initial).toBe(true);

    await page.click('button:has-text("Previous")');
    await expect(page.locator('button:has-text("Jump to Today")')).toBeVisible();

    await page.click('button:has-text("Jump to Today")');
    await expect(page.locator('button:has-text("Jump to Today")')).not.toBeVisible();
  });
});
