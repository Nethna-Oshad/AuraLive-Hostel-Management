import { test, expect } from '@playwright/test';

// ==========================================
// 1. MOCK SESSION DATA
// ==========================================
const studentUser = {
  _id: 'student-123',
  name: 'Nethna Oshad',
  email: 'nethnaoshad@gmail.com',
  role: 'Student',
};

function setupSession(page, user) {
  return page.addInitScript((userInfo) => {
    window.localStorage.setItem('userInfo', JSON.stringify(userInfo));
  }, user);
}

test('User can submit a contact message via Help Center', async ({ page }) => {
  await setupSession(page, studentUser);

  // Mock the Contact API
  await page.route('**/api/contact', async (route) => {
    await page.waitForTimeout(500); // Tiny wait to see the loading spinner
    await route.fulfill({ 
      status: 201, 
      json: { message: 'Message sent successfully!' } 
    });
  });

  // ==========================================
  // STEP 2: NAVIGATE TO CORRECT ROUTE
  // ==========================================
  // FIXED: Using the exact route from your App.jsx
  await page.goto('http://localhost:5173/help-center');

  // Verify page loaded
  const heading = page.getByRole('heading', { name: 'Help Center' });
  await expect(heading).toBeVisible({ timeout: 15000 });

  // ==========================================
  // STEP 3: FILL OUT THE FORM
  // ==========================================
  await page.locator('input[name="name"]').fill('Kamal Perera', { force: true });
  await page.locator('input[name="email"]').fill('kamal@student.sliit.lk', { force: true });
  await page.locator('input[name="phone"]').fill('0771234567', { force: true });
  await page.locator('textarea[name="message"]').fill('Hi, I need help with my SLIIT assignments connection.', { force: true });

  await page.waitForTimeout(1000); // Quick pause so panel can see it

  // ==========================================
  // STEP 4: SUBMIT THE FORM
  // ==========================================
  const submitBtn = page.getByRole('button', { name: 'Send Message' });
  await submitBtn.click({ force: true });

  // ==========================================
  // STEP 5: VERIFY SUCCESS MESSAGE
  // ==========================================
  // Wait for the green success banner text
  const successBanner = page.locator('text=Message sent successfully!');
  await expect(successBanner).toBeVisible({ timeout: 15000 });

  // Form should be cleared
  await expect(page.locator('input[name="name"]')).toHaveValue('');
  await page.waitForTimeout(1000); 
});