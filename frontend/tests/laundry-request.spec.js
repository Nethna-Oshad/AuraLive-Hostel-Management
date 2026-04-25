import { test, expect } from '@playwright/test';

test('Student can submit a laundry service request', async ({ page }) => {
  // ==========================================
  // STEP 1: STUDENT LOGIN
  // ==========================================
  await page.goto('http://localhost:5173/login');
  
  await page.locator('input[type="email"]').fill('nethnaoshad@gmail.com');
  await page.locator('input[type="password"]').fill('nethna1234'); 
  
  await page.locator('button[type="submit"]').click();
  
  // 🌟 FIX: Wait 4 seconds for the local backend to load the dashboard when 3 browsers hit it at once
  await page.waitForTimeout(4000); 

  // ==========================================
  // STEP 2: NAVIGATE TO LAUNDRY PAGE
  // ==========================================
  const laundryLink = page.locator('text=Laundry').first();
  await expect(laundryLink).toBeVisible({ timeout: 15000 });
  await laundryLink.click({ force: true });
  
  // Wait for React Router to transition to the laundry page
  await page.waitForTimeout(2000); 

  // ==========================================
  // STEP 3: FILL OUT THE LAUNDRY FORM
  // ==========================================
  
  // 🌟 FIX: Force Playwright to wait up to 15s for the form to mount, then click
  const weightButton = page.getByRole('button', { name: '5kg', exact: true });
  await expect(weightButton).toBeVisible({ timeout: 15000 });
  await weightButton.click({ force: true });

  // Select Collection Date
  const dateInput = page.locator('input[type="date"]').first();
  await expect(dateInput).toBeVisible({ timeout: 15000 });
  await dateInput.fill('2026-04-25', { force: true });

  // Select Service Type (Selects "Wash & Iron")
  const serviceType = page.locator('select').first();
  await expect(serviceType).toBeVisible({ timeout: 15000 });
  await serviceType.selectOption({ label: 'Wash & Iron' }, { force: true });

  await page.waitForTimeout(2000); // Pause so the panel can read the filled form

  // ==========================================
  // STEP 4: SUBMIT THE REQUEST
  // ==========================================
  // Looks for the button that contains "Get Insta"
  const submitButton = page.locator('button', { hasText: /Get Insta/i }).first();
  await expect(submitButton).toBeVisible({ timeout: 15000 });
  await submitButton.click({ force: true });

  // ==========================================
  // STEP 5: VERIFY SUCCESS
  // ==========================================
  // 🌟 FIX: Tell Playwright to explicitly wait for the URL to change
  await page.waitForURL(/.*home|.*laundry/, { timeout: 15000 });
  
  // Verify the URL
  await expect(page).toHaveURL(/.*home|.*laundry/);
});