import { test, expect } from '@playwright/test';

// TC-E2E-001: Landing page loads and clicking Enter navigates to dashboard
test('TC-E2E-001: login page loads and navigates to dashboard', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Team Expense Tracker')).toBeVisible();
  await page.getByTestId('login-button').click();
  await page.waitForURL(/.*dashboard/);
  await expect(page.getByText('Dashboard')).toBeVisible();
});
