import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('login-button').click();
  await page.waitForURL(/.*dashboard/);
});

// TC-E2E-013: Delete expense from edit page
test('TC-E2E-013: delete expense from edit page removes it from dashboard', async ({ page }) => {
  // Count expenses before delete
  const expensesBefore = await page.getByTestId(/expense-row-/).count();

  await page.getByTestId('expense-row-1').click();
  await page.waitForURL(/.*edit-expense/);

  await page.getByTestId('delete-btn').click();
  await page.waitForURL(/.*dashboard/);

  const expensesAfter = await page.getByTestId(/expense-row-/).count();
  expect(expensesAfter).toBeLessThan(expensesBefore);
});

// TC-E2E-014: Employee shares update after deletion
test('TC-E2E-014: employee shares update after expense deletion', async ({ page }) => {
  const getsBackBefore = await page.getByTestId('gets-back').textContent();

  await page.getByTestId('expense-row-1').click();
  await page.waitForURL(/.*edit-expense/);

  await page.getByTestId('delete-btn').click();
  await page.waitForURL(/.*dashboard/);

  const getsBackAfter = await page.getByTestId('gets-back').textContent();
  expect(getsBackAfter).not.toEqual(getsBackBefore);
});
