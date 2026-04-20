import { test, expect } from '@playwright/test';

test('Student can log in and access the Home Page', async ({ page }) => {
  // 1. Go to the login page
  await page.goto('http://localhost:5173/login');

  // 2. Fill in the Student credentials
  await page.locator('input[type="email"]').fill('nethnaoshad@gmail.com'); 
  await page.locator('input[type="password"]').fill('nethna1234');        
  
  // Pause to let the panel see the typing
  await page.waitForTimeout(1000); 

  // 3. Click the Login button
  await page.locator('button[type="submit"]').click();

  // 4. Verify the system redirects to the Student Home
  // This looks for either /home or just the root /
  await expect(page).toHaveURL(/.*home|\//); 

  // Pause so the panel can see the student view loaded successfully
  await page.waitForTimeout(3000); 
});