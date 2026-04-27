# Playwright Testing Plan - Health Tracker Application

## Overview
Comprehensive end-to-end testing strategy using Playwright for the Health Tracker application, covering all user flows and critical functionality.

## Setup

### Installation
```bash
cd frontend
npm install -D @playwright/test
npx playwright install
```

### Configuration
Create `playwright.config.ts` in frontend directory:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Test Structure

### Directory Organization
```
frontend/
├── e2e/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   ├── register.spec.ts
│   │   └── logout.spec.ts
│   ├── nutrition/
│   │   ├── food-logging.spec.ts
│   │   ├── custom-foods.spec.ts
│   │   └── nutrition-summary.spec.ts
│   ├── exercise/
│   │   ├── log-cardio.spec.ts
│   │   ├── log-strength.spec.ts
│   │   └── exercise-history.spec.ts
│   ├── measurements/
│   │   ├── weight-tracking.spec.ts
│   │   └── body-measurements.spec.ts
│   ├── water/
│   │   └── water-tracking.spec.ts
│   ├── dashboard/
│   │   ├── dashboard-overview.spec.ts
│   │   └── trends-analytics.spec.ts
│   └── fixtures/
│       ├── auth.fixture.ts
│       └── test-data.ts
```

## Test Scenarios

### 1. Authentication Tests

#### `e2e/auth/register.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('User Registration', () => {
  test('should register a new user successfully', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="dateOfBirth"]', '1990-01-01');
    await page.selectOption('select[name="gender"]', 'MALE');
    await page.fill('input[name="height"]', '175');

    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', '123'); // Too short
    await page.click('button[type="submit"]');

    // Should show error messages
    await expect(page.locator('text=Invalid email')).toBeVisible();
    await expect(page.locator('text=Password must be')).toBeVisible();
  });

  test('should prevent duplicate email registration', async ({ page }) => {
    // Assuming user already exists
    await page.goto('/register');

    await page.fill('input[name="email"]', 'existing@example.com');
    await page.fill('input[name="password"]', 'SecurePass123!');
    // ... fill other fields

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Email already registered')).toBeVisible();
  });
});
```

#### `e2e/auth/login.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('User Login', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=John Doe')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'WrongPassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should redirect authenticated users from login page', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');

    // Try to access login again
    await page.goto('/login');
    await expect(page).toHaveURL('/dashboard');
  });
});
```

### 2. Nutrition Tests

#### `e2e/nutrition/food-logging.spec.ts`
```typescript
import { test, expect } from '@playwright/test';
import { loginAsUser } from '../fixtures/auth.fixture';

test.describe('Food Logging', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test('should log a breakfast item', async ({ page }) => {
    await page.goto('/nutrition');

    // Click Add Food button
    await page.click('text=Add Food');

    // Fill in food details
    await page.selectOption('select[name="mealType"]', 'BREAKFAST');
    await page.fill('input[name="foodName"]', 'Scrambled Eggs');
    await page.fill('input[name="servingSize"]', '2');
    await page.fill('input[name="servingUnit"]', 'eggs');
    await page.fill('input[name="calories"]', '180');
    await page.fill('input[name="protein"]', '14');
    await page.fill('input[name="carbs"]', '2');
    await page.fill('input[name="fats"]', '12');

    await page.click('button:has-text("Add Food")');

    // Verify food appears in list
    await expect(page.locator('text=Scrambled Eggs')).toBeVisible();
    await expect(page.locator('text=180')).toBeVisible();
  });

  test('should update daily nutrition summary', async ({ page }) => {
    await page.goto('/nutrition');

    // Get initial calorie count
    const initialCalories = await page.locator('[data-testid="total-calories"]').textContent();

    // Add a food item
    await page.click('text=Add Food');
    await page.fill('input[name="foodName"]', 'Apple');
    await page.fill('input[name="calories"]', '95');
    // ... fill other fields
    await page.click('button:has-text("Add Food")');

    // Verify summary updated
    const newCalories = await page.locator('[data-testid="total-calories"]').textContent();
    expect(parseInt(newCalories!)).toBeGreaterThan(parseInt(initialCalories!));
  });

  test('should delete a food entry', async ({ page }) => {
    await page.goto('/nutrition');

    // Assuming there's already a food entry
    await page.click('button:has-text("Delete"):first');

    // Confirm deletion
    await page.click('text=Yes, delete');

    // Entry should disappear
    await expect(page.locator('[data-testid="food-entry"]:first')).not.toBeVisible();
  });
});
```

### 3. Exercise Tests

#### `e2e/exercise/log-cardio.spec.ts`
```typescript
import { test, expect } from '@playwright/test';
import { loginAsUser } from '../fixtures/auth.fixture';

test.describe('Cardio Exercise Logging', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test('should log a cardio exercise with all fields', async ({ page }) => {
    await page.goto('/exercise');

    await page.click('text=Add Exercise');

    // Fill cardio exercise
    await page.selectOption('select[name="exerciseType"]', 'CARDIO');
    await page.fill('input[name="name"]', 'Morning Run');
    await page.fill('input[name="duration"]', '30');
    await page.fill('input[name="distance"]', '5.0');
    await page.fill('input[name="caloriesBurned"]', '300');
    await page.fill('input[name="averageHeartRate"]', '145');
    await page.selectOption('select[name="intensity"]', 'MODERATE');

    await page.click('button:has-text("Log Exercise")');

    // Verify exercise appears
    await expect(page.locator('text=Morning Run')).toBeVisible();
    await expect(page.locator('text=30 min')).toBeVisible();
    await expect(page.locator('text=5.0 km')).toBeVisible();
  });

  test('should show cardio-specific fields only', async ({ page }) => {
    await page.goto('/exercise');
    await page.click('text=Add Exercise');

    await page.selectOption('select[name="exerciseType"]', 'CARDIO');

    // Cardio fields should be visible
    await expect(page.locator('input[name="distance"]')).toBeVisible();
    await expect(page.locator('input[name="averageHeartRate"]')).toBeVisible();

    // Strength fields should not be visible
    await expect(page.locator('input[name="sets"]')).not.toBeVisible();
    await expect(page.locator('input[name="reps"]')).not.toBeVisible();
  });
});
```

#### `e2e/exercise/log-strength.spec.ts`
```typescript
import { test, expect } from '@playwright/test';
import { loginAsUser } from '../fixtures/auth.fixture';

test.describe('Strength Exercise Logging', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test('should log a strength exercise', async ({ page }) => {
    await page.goto('/exercise');

    await page.click('text=Add Exercise');

    await page.selectOption('select[name="exerciseType"]', 'STRENGTH');
    await page.fill('input[name="name"]', 'Bench Press');
    await page.fill('input[name="sets"]', '3');
    await page.fill('input[name="reps"]', '10');
    await page.fill('input[name="weight"]', '60');
    await page.fill('input[name="duration"]', '20');

    await page.click('button:has-text("Log Exercise")');

    await expect(page.locator('text=Bench Press')).toBeVisible();
    await expect(page.locator('text=3 × 10 @ 60kg')).toBeVisible();
  });

  test('should show strength-specific fields only', async ({ page }) => {
    await page.goto('/exercise');
    await page.click('text=Add Exercise');

    await page.selectOption('select[name="exerciseType"]', 'STRENGTH');

    // Strength fields should be visible
    await expect(page.locator('input[name="sets"]')).toBeVisible();
    await expect(page.locator('input[name="reps"]')).toBeVisible();
    await expect(page.locator('input[name="weight"]')).toBeVisible();

    // Cardio fields should not be visible
    await expect(page.locator('input[name="distance"]')).not.toBeVisible();
  });
});
```

### 4. Dashboard & Analytics Tests

#### `e2e/dashboard/trends-analytics.spec.ts`
```typescript
import { test, expect } from '@playwright/test';
import { loginAsUser } from '../fixtures/auth.fixture';

test.describe('Trends & Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test('should display trends charts', async ({ page }) => {
    await page.goto('/dashboard');

    // Verify charts section exists
    await expect(page.locator('text=Trends & Analytics')).toBeVisible();

    // Check time range buttons
    await expect(page.locator('button:has-text("7 days")')).toBeVisible();
    await expect(page.locator('button:has-text("30 days")')).toBeVisible();
    await expect(page.locator('button:has-text("90 days")')).toBeVisible();
  });

  test('should switch between chart tabs', async ({ page }) => {
    await page.goto('/dashboard');

    // Click Nutrition tab
    await page.click('button:has-text("Nutrition")');
    await expect(page.locator('text=Daily Calories')).toBeVisible();

    // Click Exercise tab
    await page.click('button:has-text("Exercise")');
    await expect(page.locator('text=Daily Exercise Duration')).toBeVisible();

    // Click Water tab
    await page.click('button:has-text("Water")');
    await expect(page.locator('text=Daily Water Intake')).toBeVisible();

    // Click Weight tab
    await page.click('button:has-text("Weight")');
    await expect(page.locator('text=Weight Progress')).toBeVisible();
  });

  test('should change time range', async ({ page }) => {
    await page.goto('/dashboard');

    // Click 30 days
    await page.click('button:has-text("30 days")');
    await page.waitForResponse(response =>
      response.url().includes('/dashboard/trends') && response.status() === 200
    );

    // Verify button is active
    await expect(page.locator('button:has-text("30 days")')).toHaveClass(/bg-blue-600/);
  });
});
```

### 5. Measurements Tests

#### `e2e/measurements/weight-tracking.spec.ts`
```typescript
import { test, expect } from '@playwright/test';
import { loginAsUser } from '../fixtures/auth.fixture';

test.describe('Weight Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test('should log weight measurement', async ({ page }) => {
    await page.goto('/measurements');

    // Should be on Weight tab by default
    await page.fill('input[name="weight"]', '75.5');
    await page.click('button:has-text("Log Weight")');

    // Should show success and update display
    await expect(page.locator('text=75.5 kg')).toBeVisible();

    // BMI should be calculated
    await expect(page.locator('[data-testid="bmi-value"]')).toBeVisible();
  });

  test('should display weight trend chart', async ({ page }) => {
    await page.goto('/measurements');

    // Verify chart exists (assuming some weight data exists)
    await expect(page.locator('[data-testid="weight-chart"]')).toBeVisible();

    // Statistics should be visible
    await expect(page.locator('text=Current Weight')).toBeVisible();
    await expect(page.locator('text=Total Change')).toBeVisible();
  });
});
```

### 6. Water Tracking Tests

#### `e2e/water/water-tracking.spec.ts`
```typescript
import { test, expect } from '@playwright/test';
import { loginAsUser } from '../fixtures/auth.fixture';

test.describe('Water Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test('should log water intake with quick add', async ({ page }) => {
    await page.goto('/water');

    // Click 250ml quick add
    await page.click('button:has-text("250ml")');

    // Progress should update
    await expect(page.locator('[data-testid="water-progress"]')).toBeVisible();
  });

  test('should log custom water amount', async ({ page }) => {
    await page.goto('/water');

    await page.fill('input[name="amount"]', '350');
    await page.click('button:has-text("Log Water")');

    // Should appear in history
    await expect(page.locator('text=350 ml')).toBeVisible();
  });

  test('should show progress toward goal', async ({ page }) => {
    await page.goto('/water');

    // Progress indicator should be visible
    const progress = await page.locator('[data-testid="water-percentage"]').textContent();
    expect(progress).toMatch(/\d+%/);
  });
});
```

## Fixtures & Helpers

### `e2e/fixtures/auth.fixture.ts`
```typescript
import { Page } from '@playwright/test';

export async function loginAsUser(page: Page) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'SecurePass123!');
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

export async function createTestUser(page: Page, userData: any) {
  await page.goto('/register');

  await page.fill('input[name="email"]', userData.email);
  await page.fill('input[name="password"]', userData.password);
  await page.fill('input[name="firstName"]', userData.firstName);
  await page.fill('input[name="lastName"]', userData.lastName);
  await page.fill('input[name="dateOfBirth"]', userData.dateOfBirth);
  await page.selectOption('select[name="gender"]', userData.gender);
  await page.fill('input[name="height"]', userData.height.toString());

  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}
```

### `e2e/fixtures/test-data.ts`
```typescript
export const testUsers = {
  validUser: {
    email: 'test@example.com',
    password: 'SecurePass123!',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-01-01',
    gender: 'MALE',
    height: 175,
  },

  anotherUser: {
    email: 'jane@example.com',
    password: 'SecurePass456!',
    firstName: 'Jane',
    lastName: 'Smith',
    dateOfBirth: '1992-05-15',
    gender: 'FEMALE',
    height: 165,
  },
};

export const sampleFoods = [
  {
    name: 'Grilled Chicken Breast',
    calories: 165,
    protein: 31,
    carbs: 0,
    fats: 3.6,
    servingSize: 100,
    servingUnit: 'g',
  },
  {
    name: 'Brown Rice',
    calories: 111,
    protein: 2.6,
    carbs: 23,
    fats: 0.9,
    servingSize: 100,
    servingUnit: 'g',
  },
];
```

## Running Tests

### Commands
```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test e2e/auth/login.spec.ts

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests in specific browser
npx playwright test --project=chromium

# Run tests in debug mode
npx playwright test --debug

# Generate test report
npx playwright show-report

# Run tests with UI
npx playwright test --ui
```

### CI/CD Integration
```yaml
# .github/workflows/playwright.yml
name: Playwright Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - uses: actions/setup-node@v3
      with:
        node-version: 18

    - name: Install dependencies
      run: |
        cd frontend && npm ci
        cd ../backend && npm ci

    - name: Install Playwright Browsers
      run: cd frontend && npx playwright install --with-deps

    - name: Start backend
      run: cd backend && npm run dev &

    - name: Run Playwright tests
      run: cd frontend && npx playwright test

    - uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: frontend/playwright-report/
        retention-days: 30
```

## Test Coverage Goals

- **Authentication**: 100% (critical path)
- **Food Logging**: 90%
- **Exercise Tracking**: 90%
- **Measurements**: 85%
- **Water Tracking**: 85%
- **Dashboard**: 80%
- **Settings**: 75%

## Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Avoid hard-coded waits** - use Playwright's auto-waiting
3. **Clean up test data** after each test
4. **Use fixtures** for common setup (login, etc.)
5. **Test edge cases** (empty states, errors, etc.)
6. **Mobile testing** - test on mobile viewports
7. **Accessibility** - include basic a11y checks
8. **Performance** - monitor load times
9. **Visual regression** - screenshot comparison tests
10. **API mocking** - mock external APIs when needed

## Next Steps

1. Implement core test suites (auth, nutrition, exercise)
2. Add visual regression tests with `toHaveScreenshot()`
3. Setup CI/CD pipeline
4. Add accessibility tests with `@axe-core/playwright`
5. Implement API testing alongside E2E tests
6. Add performance monitoring with Lighthouse
7. Create test data management strategy
8. Document test writing guidelines for team
