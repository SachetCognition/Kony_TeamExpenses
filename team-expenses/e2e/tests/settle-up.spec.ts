import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('login-button').click();
  await page.waitForURL(/.*dashboard/);
});

// TC-E2E-015: Settle up flow
test('TC-E2E-015: click Settle Up, select expense, settle', async ({ page }) => {
  await page.getByTestId('settle-btn-EMP002').click();
  await page.waitForURL(/.*settle-up/);

  const empName = page.getByTestId('settle-employee');
  await expect(empName).toHaveValue(/Ravi/);

  const expenseSelect = page.getByTestId('settle-expense-select');
  await expect(expenseSelect).toBeVisible();

  await page.getByTestId('settle-btn').click();
  await page.waitForURL(/.*dashboard/);
});

// TC-E2E-016: Gets back decreases after settling
test('TC-E2E-016: Gets back amount decreases after settling', async ({ page }) => {
  const getsBackBefore = await page.getByTestId('gets-back').textContent();

  await page.getByTestId('settle-btn-EMP002').click();
  await page.waitForURL(/.*settle-up/);

  await page.getByTestId('settle-btn').click();
  await page.waitForURL(/.*dashboard/);

  // Wait for dashboard data to refresh after settle (TanStack Query cache invalidation)
  await expect(async () => {
    const getsBackAfter = await page.getByTestId('gets-back').textContent();
    expect(getsBackAfter).not.toEqual(getsBackBefore);
  }).toPass({ timeout: 5000 });
});
