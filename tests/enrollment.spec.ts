import { test, expect } from '@playwright/test';

test.describe('Enrollment Flows', () => {
  test('should display courses on the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Check if the "Browse Library" button or link is there
    await expect(page.locator('a:has-text("Browse Library")').first()).toBeVisible({ timeout: 15000 });
    
    // Navigate to courses page
    await page.click('a:has-text("Browse Library")');
    await expect(page).toHaveURL(/.*courses/, { timeout: 15000 });

    
    // Check if course search works
    const searchInput = page.locator('input[placeholder="Search courses, skills, or topics..."]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('system design');
      await page.keyboard.press('Enter');
    }
  });

  test('should view a course curriculum preview', async ({ page }) => {
    await page.goto('/courses');
    
    // Find the first course card link and click it
    const courseLink = page.locator('a[href^="/courses/"]').first();
    
    if (await courseLink.isVisible()) {
      await courseLink.click();
      
      // Should show the dynamic curriculum sections
      await expect(page.locator('text=Course Curriculum')).toBeVisible();
    }
  });
});
