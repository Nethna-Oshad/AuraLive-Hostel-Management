import { test, expect } from '@playwright/test';

test('Admin can log in and access the Admin Dashboard', async ({ page }) => {
  // 1. Go to the login page
  await page.goto('http://localhost:5173/login');

  // 2. Fill in the Admin credentials
  await page.locator('input[type="email"]').fill('admin@auralive.com'); // <-- CHANGE THIS
  await page.locator('input[type="password"]').fill('admin123');        // <-- CHANGE THIS
  
  // Pause to let the panel see the typing
  await page.waitForTimeout(1000); 

  // 3. Click the Login button
  await page.locator('button[type="submit"]').click();

  // 4. Verify the system redirects to the Admin Dashboard
  await expect(page).toHaveURL(/.*admin\/dashboard/);

  // Pause so the panel can see the dashboard loaded successfully
  await page.waitForTimeout(3000); 
});