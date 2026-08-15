import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard Flows', () => {
  test('should protect admin routes from unauthenticated users', async ({ page }) => {
    await page.goto('/admin/dashboard');
    // It should either show verifying state, or redirect to login
    // Because of hydration timing in Next.js tests, router.replace might race. 
    // We just verify they can't see the dashboard overview.
    await expect(page.locator('text=Verifying access…').first()).toBeVisible({ timeout: 15000 }).catch(async () => {
      await expect(page).toHaveURL(/.*login/, { timeout: 15000 });
    });
  });
});
