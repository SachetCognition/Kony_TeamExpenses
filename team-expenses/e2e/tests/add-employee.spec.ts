import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('login-button').click();
  await page.waitForURL(/.*dashboard/);
});

// TC-E2E-019: Add employee flow
test('TC-E2E-019: navigate to Add Employee, create, verify', async ({ page }) => {
  await page.getByTestId('add-employee-btn').click();
  await page.waitForURL(/.*add-employee/);

  await page.getByTestId('employee-id').fill('EMP006');
  await page.getByTestId('employee-name').fill('Deepak');
  await page.getByTestId('create-btn').click();

  await page.waitForURL(/.*dashboard/);
});
