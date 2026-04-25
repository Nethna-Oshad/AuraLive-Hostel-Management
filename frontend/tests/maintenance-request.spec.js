import { test, expect } from '@playwright/test';

test('Student can submit a maintenance repair ticket', async ({ page }) => {
  // ==========================================
  // STEP 1: STUDENT LOGIN
  // ==========================================
  await page.goto('http://localhost:5173/login');
  
  await page.locator('input[type="email"]').fill('nethnaoshad@gmail.com');
  await page.locator('input[type="password"]').fill('nethna1234'); 
  await page.locator('button[type="submit"]').click();
  
  // 🌟 FIX: Wait 4 seconds for the local backend to load when 3 browsers hit it at once
  await page.waitForTimeout(4000);

  // ==========================================
  // STEP 2: NAVIGATE TO REPAIR REQUEST
  // ==========================================
  const repairLink = page.locator('text=Repair Request').first();
  await expect(repairLink).toBeVisible({ timeout: 15000 });
  await repairLink.click({ force: true });
  
  // Wait for React Router to transition to the maintenance page
  await page.waitForTimeout(2000); 

  // ==========================================
  // STEP 3: FILL OUT THE TEXTAREA DESCRIPTION
  // ==========================================
  const descInput = page.locator('textarea').first();
  
  // 🌟 FIX: Smart wait up to 15s for the text area to mount
  await expect(descInput).toBeVisible({ timeout: 15000 });
  await descInput.fill('The AC unit in my room is dropping water near the bed. Please fix it soon.', { force: true });

  await page.waitForTimeout(1500); // Quick pause so the panel can read it

  // ==========================================
  // STEP 4: SUBMIT THE TICKET
  // ==========================================
  const submitButton = page.locator('button[type="submit"]').first();
  await expect(submitButton).toBeVisible({ timeout: 15000 });
  await submitButton.click({ force: true });

  // ==========================================
  // STEP 5: VERIFY SUCCESS
  // ==========================================
  // 🌟 FIX: Tell Playwright to explicitly wait up to 15s for the redirect
  await page.waitForURL(/.*home/, { timeout: 15000 });
  
  // Verify the final URL
  await expect(page).toHaveURL(/.*home/);
});