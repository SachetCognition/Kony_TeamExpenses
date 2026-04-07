import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('login-button').click();
  await page.waitForURL(/.*dashboard/);
});

// TC-E2E-020: Search filters employees
test('TC-E2E-020: search filters employee shares by name', async ({ page }) => {
  const searchInput = page.getByTestId('search-input');
  await searchInput.fill('Ravi');

  await expect(page.getByText('Ravi')).toBeVisible();
  // Other employees should be hidden
  await expect(page.getByText('Priya')).not.toBeVisible();
});

// TC-E2E-021: Clear search restores full list
test('TC-E2E-021: clear search restores full employee list', async ({ page }) => {
  const searchInput = page.getByTestId('search-input');
  await searchInput.fill('Ravi');
  await expect(page.getByText('Priya')).not.toBeVisible();

  await page.getByTestId('clear-search-btn').click();
  await expect(page.getByText('Ravi')).toBeVisible();
  await expect(page.getByText('Priya')).toBeVisible();
});
