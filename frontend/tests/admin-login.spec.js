import { test, expect } from '@playwright/test';

test('Admin can log in and access the Admin Dashboard', async ({ page }) => {
  await page.goto('http://localhost:5173/login');

  // 👇 STOP AND CHANGE THESE TWO LINES 👇
  // Type the exact email and password you use when you log in manually as an Admin.
  await page.locator('input[type="email"]').fill('admin@auralive.com'); 
  await page.locator('input[type="password"]').fill('admin123');        
  // 👆 -------------------------------- 👆

  await page.waitForTimeout(1000); 
  await page.locator('button[type="submit"]').click();

  // Give the server an extra 2 seconds to verify the password and redirect
  await page.waitForTimeout(2000);

  // Verifies it successfully navigated to the admin dashboard
  await expect(page).toHaveURL(/.*admin/);
  await page.waitForTimeout(3000); 
});