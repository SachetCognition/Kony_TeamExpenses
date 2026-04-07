import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('login-button').click();
  await page.waitForURL(/.*dashboard/);
});

// TC-E2E-018: Add category flow
test('TC-E2E-018: navigate to Add Category, create, verify', async ({ page }) => {
  await page.getByTestId('add-category-btn').click();
  await page.waitForURL(/.*add-category/);

  await page.getByTestId('category-name').fill('Healthcare');
  await page.getByTestId('category-desc').fill('Medical and health expenses');
  await page.getByTestId('create-btn').click();

  await page.waitForURL(/.*dashboard/);
});
