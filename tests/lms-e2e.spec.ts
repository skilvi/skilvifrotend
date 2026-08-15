import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('End to End LMS Flow', () => {
  // Use a unique email suffix for every test run to avoid unique constraint errors
  const timestamp = Date.now();
  const instructorEmail = `instr_${timestamp}@test.com`;
  const studentEmail = `student_${timestamp}@test.com`;
  const password = 'Password123!';
  const courseName = `E2E Masterclass ${timestamp}`;

  test('Instructor creates course, Student buys course', async ({ browser }) => {
    // -----------------------------------------------------
    // STAGE 1: INSTRUCTOR REGISTRATION & COURSE CREATION
    // -----------------------------------------------------
    const instructorContext = await browser.newContext();
    const instructorPage = await instructorContext.newPage();
    
    // 1. Register Instructor
    await instructorPage.goto('/register/instructor');
    await instructorPage.locator('input[name="displayName"]').fill('Test Instructor');
    await instructorPage.locator('input[name="email"]').fill(instructorEmail);
    await instructorPage.locator('input[name="password"]').fill(password);
    await instructorPage.getByRole('button', { name: 'Create Instructor Account' }).click();

    // Fill Phone Capture Modal
    await instructorPage.locator('input#phone').waitFor();
    await instructorPage.locator('input#phone').fill('9876543210');
    await instructorPage.getByRole('button', { name: 'Continue' }).click();

    // 2. Go to Dashboard -> New Course
    await instructorPage.waitForURL('**/instructor/courses');
    await instructorPage.waitForTimeout(2000); // Give auth state and cookies time to settle
    await instructorPage.goto('/instructor/courses/new');
    
    // 3. Create Course
    await instructorPage.getByPlaceholder(/e.g. Master NestJS/i).fill(courseName);
    await instructorPage.getByRole('button', { name: /Create/i }).click();
    
    // Wait for the curriculum edit page
    await instructorPage.waitForURL(/\/instructor\/courses\/.*\/edit/);
    await instructorPage.getByRole('link', { name: /Curriculum/i }).click();
    
    // 4. Add 3 Sections
    for (let i = 0; i < 3; i++) {
      await instructorPage.getByRole('button', { name: /\+ Add Section/i }).click();
      await instructorPage.waitForTimeout(1000); // Wait for modal
      await instructorPage.getByPlaceholder(/e.g. Fundamental Concepts/i).fill(`Section ${i + 1}`);
      await instructorPage.getByRole('button', { name: /Confirm/i }).click();
      await instructorPage.waitForTimeout(1000); // Wait for optimistic update
    }

    // 5. Add 1 Video to the first section
    // Get the first section's add lecture button (since we added 3, there will be 3 such buttons)
    await instructorPage.getByRole('button', { name: /\+ Add Lecture/i }).first().click();
    await instructorPage.waitForTimeout(1000); // Wait for modal
    await instructorPage.getByPlaceholder(/e.g. Intro to NestJS Hooks/i).fill(`Video 1`);
    await instructorPage.getByRole('button', { name: /Confirm/i }).click();
    await instructorPage.waitForTimeout(1000);
    // Find the newly created lecture to edit/upload
    await instructorPage.getByText('Video 1').click();
    await instructorPage.waitForTimeout(1000);
    // Assuming a file input appears
    const dummyVideoPath = 'C:\\Users\\sande\\Downloads\\3rd course skilvi\\dummy_video.mp4';
    await instructorPage.setInputFiles('input[type="file"]', dummyVideoPath);
    await instructorPage.waitForTimeout(5000); // Wait for fake/real upload
    
    // 6. Save/Publish
    // This assumes there's a save or publish button
    const publishBtn = instructorPage.getByRole('button', { name: /Publish/i });
    if (await publishBtn.isVisible()) {
      await publishBtn.click();
    }
    
    // 7. Logout
    await instructorPage.goto('/dashboard');
    await instructorPage.getByRole('button', { name: /Logout|Sign Out/i }).first().click();
    await instructorContext.close();

    // -----------------------------------------------------
    // STAGE 2: STUDENT REGISTRATION & ENROLLMENT
    // -----------------------------------------------------
    const studentContext = await browser.newContext();
    const studentPage = await studentContext.newPage();

    // 1. Register Student
    await studentPage.goto('/register');
    await studentPage.locator('input[name="displayName"]').fill('Test Student');
    await studentPage.locator('input[name="email"]').fill(studentEmail);
    await studentPage.locator('input[name="password"]').fill(password);
    await studentPage.getByRole('button', { name: 'Create Account' }).first().click();
    
    // Fill Phone Capture Modal
    await studentPage.locator('input#phone').waitFor();
    await studentPage.locator('input#phone').fill('9876543211');
    await studentPage.getByRole('button', { name: 'Continue' }).click();

    // 2. Find Course and Enroll
    await studentPage.goto('/courses');
    await studentPage.getByPlaceholder(/Search/i).fill(courseName);
    await studentPage.keyboard.press('Enter');
    await studentPage.getByText(courseName).first().click();
    
    // 3. Enroll / Buy
    await studentPage.getByRole('button', { name: /Enroll|Buy/i }).click();
    await studentPage.waitForTimeout(2000);
    
    // Verify enrolled successfully by looking for "Go to Course" or similar
    await expect(studentPage.getByRole('button', { name: /Go to Course|Start Learning/i })).toBeVisible();

    await studentContext.close();
  });
});
