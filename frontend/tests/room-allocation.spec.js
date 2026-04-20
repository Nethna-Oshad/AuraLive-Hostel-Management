import { test, expect } from '@playwright/test';

test('Student completes the full room booking journey', async ({ page }) => {
  // ==========================================
  // STEP 1: STUDENT LOGIN
  // ==========================================
  await page.goto('http://localhost:5173/login');
  await page.locator('input[type="email"]').fill('nethnaoshad@gmail.com');
  await page.locator('input[type="password"]').fill('nethna1234'); // <-- CHANGE TO REAL PASSWORD
  
  await page.locator('button[type="submit"]').click();
  
  // Pause to show the panel a successful login
  await page.waitForTimeout(2000); 

  // ==========================================
  // STEP 2: FIND A ROOM & CLICK BOOK
  // ==========================================
  await page.locator('text=Available Accommodations').scrollIntoViewIfNeeded();
  
  const bookButton = page.locator('button:has-text("Book This Room"):not([disabled])').first();
  await expect(bookButton).toBeVisible();
  await bookButton.click();
  
  await page.waitForTimeout(2000); // Pause to show it routed to the booking page

  // ==========================================
  // STEP 3: ACCEPT HOSTEL RULES AGREEMENT
  // ==========================================
  // Depending on how you built this, it's usually a checkbox or an 'Accept' button.
  // If it's an "Accept" button on a popup modal:
  const acceptButton = page.locator('button', { hasText: 'Accept' }).first();
  if (await acceptButton.isVisible()) {
      await acceptButton.click();
  } else {
      // If it's a checkbox instead, it will click the checkbox
      const checkbox = page.locator('input[type="checkbox"]').first();
      if (await checkbox.isVisible()) {
          await checkbox.check();
      }
  }
  await page.waitForTimeout(1000); // Pause so they see the rules were accepted

  // ==========================================
  // STEP 4: FILL OUT STUDENT INFORMATION
  // ==========================================
  // NIC Number / Passport
  await page.getByPlaceholder('e.g. 200112345678 or 991234567v').fill('200112345678');

  // Emergency Contact Name
  await page.getByPlaceholder('Guardian Name').fill('Kamal Perera');

  // Emergency Phone
  await page.getByPlaceholder('07X XXX XXXX').fill('0771234567');

  // Expected Move-in Date 
  // (Note: Playwright requires HTML date pickers to be filled in YYYY-MM-DD format)
  await page.locator('input[type="date"]').fill('2026-05-01');

  // Special Requests (Optional)
  await page.getByPlaceholder('Any medical conditions or specific requirements?').fill('No special requests, thank you.');

  // Pause so the panel can read the perfectly filled out form!
  await page.waitForTimeout(3000); 

  // ==========================================
  // STEP 5: SUBMIT THE BOOKING
  // ==========================================
  await page.locator('button', { hasText: 'Confirm & Submit Booking' }).click();

  // Pause at the end to show the success screen / payment gateway
  await page.waitForTimeout(4000); 
});