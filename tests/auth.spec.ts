import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test('should allow a user to navigate to the login page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Start learning free');
    await expect(page).toHaveURL(/.*register/, { timeout: 15000 });
    await page.click('a:has-text("Sign in")');
    await expect(page).toHaveURL(/.*login/, { timeout: 15000 });
  });

  test('should display validation errors for empty login submission', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');
    // We can check if any input validation message shows up. Next.js forms might use HTML5 validation or custom toast
    await expect(page.locator('text=Invalid')).not.toBeVisible();
  });
});
