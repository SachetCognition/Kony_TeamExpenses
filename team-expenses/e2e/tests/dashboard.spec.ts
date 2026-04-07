import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('login-button').click();
  await page.waitForURL(/.*dashboard/);
});

// TC-E2E-002: Dashboard displays seeded expenses
test('TC-E2E-002: dashboard displays seeded expenses with categories and amounts', async ({ page }) => {
  await expect(page.getByText('Team Lunch')).toBeVisible();
  await expect(page.getByText('Cab to Airport')).toBeVisible();
  await expect(page.getByText('Food').first()).toBeVisible();
  await expect(page.getByText('Travel').first()).toBeVisible();
});

// TC-E2E-003: Dashboard displays correct Amount Spent
test('TC-E2E-003: dashboard displays correct Amount Spent total', async ({ page }) => {
  const totalSpent = page.getByTestId('total-spent');
  await expect(totalSpent).toBeVisible();
  await expect(totalSpent).toContainText('₹');
});

// TC-E2E-004: Dashboard displays correct Gets back
test('TC-E2E-004: dashboard displays correct Gets back total', async ({ page }) => {
  const getsBack = page.getByTestId('gets-back');
  await expect(getsBack).toBeVisible();
  await expect(getsBack).toContainText('₹');
});

// TC-E2E-005: Dashboard displays employee shares
test('TC-E2E-005: dashboard displays employee shares list', async ({ page }) => {
  await expect(page.getByText('Ravi')).toBeVisible();
  await expect(page.getByText('Priya')).toBeVisible();
});
