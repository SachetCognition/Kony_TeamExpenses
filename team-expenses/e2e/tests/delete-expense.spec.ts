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

  // Use expense-row-5 (Office Snacks) to avoid breaking edit-expense tests that use row-1
  await page.getByTestId('expense-row-5').click();
  await page.waitForURL(/.*edit-expense/);

  // Handle the window.confirm() dialog
  page.on('dialog', dialog => dialog.accept());
  await page.getByTestId('delete-btn').click();
  await page.waitForURL(/.*dashboard/);

  // Wait for dashboard data to refresh after delete (TanStack Query cache invalidation)
  await expect(async () => {
    const expensesAfter = await page.getByTestId(/expense-row-/).count();
    expect(expensesAfter).toBeLessThan(expensesBefore);
  }).toPass({ timeout: 5000 });
});

// TC-E2E-014: Employee shares update after deletion
test('TC-E2E-014: employee shares update after expense deletion', async ({ page }) => {
  const getsBackBefore = await page.getByTestId('gets-back').textContent();

  // Use expense-row-4 (Movie Night) to avoid conflicts with other tests
  await page.getByTestId('expense-row-4').click();
  await page.waitForURL(/.*edit-expense/);

  // Handle the window.confirm() dialog
  page.on('dialog', dialog => dialog.accept());
  await page.getByTestId('delete-btn').click();
  await page.waitForURL(/.*dashboard/);

  // Wait for dashboard data to refresh after delete (TanStack Query cache invalidation)
  await expect(async () => {
    const getsBackAfter = await page.getByTestId('gets-back').textContent();
    expect(getsBackAfter).not.toEqual(getsBackBefore);
  }).toPass({ timeout: 5000 });
});
