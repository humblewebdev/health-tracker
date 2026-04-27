import { test, expect } from '@playwright/test';

test.describe('Registration', () => {
  test('registers a new user and lands on dashboard', async ({ page }) => {
    const unique = Date.now();
    await page.goto('/register');
    await page.fill('input#firstName', 'Test');
    await page.fill('input#lastName', 'User');
    await page.fill('input#email', `user_${unique}@test.com`);
    await page.fill('input#password', 'SecurePass123!');
    await page.fill('input#confirmPassword', 'SecurePass123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('shows error when passwords do not match', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input#firstName', 'Test');
    await page.fill('input#lastName', 'User');
    await page.fill('input#email', 'mismatch@test.com');
    await page.fill('input#password', 'SecurePass123!');
    await page.fill('input#confirmPassword', 'DifferentPass456!');
    await page.click('button[type="submit"]');
    await expect(page.locator('.bg-red-100')).toBeVisible();
  });

  test('shows error for duplicate email', async ({ page }) => {
    // Use the shared test account which the setup fixture already created
    await page.goto('/register');
    await page.fill('input#firstName', 'Dup');
    await page.fill('input#lastName', 'User');
    await page.fill('input#email', 'playwright@healthtracker.test');
    await page.fill('input#password', 'TestPass123!');
    await page.fill('input#confirmPassword', 'TestPass123!');
    await page.click('button[type="submit"]');
    await expect(page.locator('.bg-red-100')).toBeVisible();
  });
});
