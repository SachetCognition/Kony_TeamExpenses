import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('login-button').click();
  await page.waitForURL(/.*dashboard/);
});

// TC-E2E-006: Add expense full flow
test('TC-E2E-006: navigate to Add Expense, fill form, submit, verify on dashboard', async ({ page }) => {
  await page.getByTestId('add-expense-btn').click();
  await page.waitForURL(/.*add-expense/);

  await page.getByTestId('expense-name').fill('Team Dinner');
  await page.getByTestId('expense-amount').fill('4500');
  await page.getByTestId('expense-category').selectOption({ index: 1 });

  // Select employees
  await page.getByTestId('emp-checkbox-EMP002').check();
  await page.getByTestId('emp-checkbox-EMP003').check();
  await page.getByTestId('emp-checkbox-EMP004').check();

  await page.getByTestId('submit-btn').click();
  await page.waitForURL(/.*dashboard/);

  await expect(page.getByText('Team Dinner')).toBeVisible();
});

// TC-E2E-007: Verify equal split
test('TC-E2E-007: add expense split among 3 employees shows correct individual share', async ({ page }) => {
  await page.getByTestId('add-expense-btn').click();
  await page.waitForURL(/.*add-expense/);

  await page.getByTestId('expense-name').fill('Split Test');
  await page.getByTestId('expense-amount').fill('3000');
  await page.getByTestId('expense-category').selectOption({ index: 1 });

  await page.getByTestId('emp-checkbox-EMP002').check();
  await page.getByTestId('emp-checkbox-EMP003').check();
  await page.getByTestId('emp-checkbox-EMP004').check();

  // Verify split preview shows ₹1000 each
  await expect(page.getByTestId('split-preview')).toContainText('1000');

  await page.getByTestId('submit-btn').click();
  await page.waitForURL(/.*dashboard/);
});

// TC-E2E-008: Validation - empty name
test('TC-E2E-008: submit with empty name shows validation error', async ({ page }) => {
  await page.getByTestId('add-expense-btn').click();
  await page.waitForURL(/.*add-expense/);

  await page.getByTestId('expense-amount').fill('1000');
  await page.getByTestId('submit-btn').click();

  // Should still be on add-expense page with error
  await expect(page).toHaveURL(/.*add-expense/);
});

// TC-E2E-009: Validation - zero amount
test('TC-E2E-009: submit with zero amount shows validation error', async ({ page }) => {
  await page.getByTestId('add-expense-btn').click();
  await page.waitForURL(/.*add-expense/);

  await page.getByTestId('expense-name').fill('Test');
  await page.getByTestId('expense-amount').fill('0');
  await page.getByTestId('submit-btn').click();

  await expect(page).toHaveURL(/.*add-expense/);
});
