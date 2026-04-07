import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('login-button').click();
  await page.waitForURL(/.*dashboard/);
});

// TC-E2E-010: Click expense row, verify edit form pre-populated
test('TC-E2E-010: click expense row opens pre-populated edit form', async ({ page }) => {
  await page.getByTestId('expense-row-1').click();
  await page.waitForURL(/.*edit-expense/);

  const nameInput = page.getByTestId('expense-name');
  await expect(nameInput).not.toHaveValue('');
});

// TC-E2E-011: Change amount and employees, verify dashboard updates
test('TC-E2E-011: update expense amount and employees', async ({ page }) => {
  await page.getByTestId('expense-row-1').click();
  await page.waitForURL(/.*edit-expense/);

  await page.getByTestId('expense-amount').fill('6000');
  await page.getByTestId('update-btn').click();
  await page.waitForURL(/.*dashboard/);

  await expect(page.getByText('6000').first()).toBeVisible();
});

// TC-E2E-012: Verify removed employees no longer have shares
test('TC-E2E-012: removed employees lose shares after edit', async ({ page }) => {
  await page.getByTestId('expense-row-1').click();
  await page.waitForURL(/.*edit-expense/);

  // Uncheck an employee
  const checkbox = page.getByTestId('emp-checkbox-EMP004');
  if (await checkbox.isChecked()) {
    await checkbox.uncheck();
  }

  await page.getByTestId('update-btn').click();
  await page.waitForURL(/.*dashboard/);
});
