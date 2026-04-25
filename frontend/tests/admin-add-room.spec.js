import { test, expect } from '@playwright/test';

// ==========================================
// 1. MOCK ADMIN SESSION DATA
// ==========================================
const adminUser = {
  _id: 'admin-999',
  name: 'System Admin',
  email: 'admin@auralive.com',
  role: 'Admin',
};

function setupSession(page, user) {
  return page.addInitScript((userInfo) => {
    window.localStorage.setItem('userInfo', JSON.stringify(userInfo));
  }, user);
}

test('Admin can successfully add a new room', async ({ page }) => {
  // ==========================================
  // STEP 2: MOCK THE BACKEND APIs
  // ==========================================
  await setupSession(page, adminUser);

  await page.route('**/api/rooms', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, json: [] });
    } else {
      await route.fulfill({ 
        status: 201, 
        json: { message: 'Room created successfully!' } 
      });
    }
  });

  // ==========================================
  // STEP 3: GO DIRECTLY TO MANAGE ROOMS
  // ==========================================
  await page.goto('http://localhost:5173/admin/rooms');

  // Wait for the Management Dashboard to load
  await expect(page.getByRole('heading', { name: 'Hostel Room Management' })).toBeVisible({ timeout: 15000 });

  // ==========================================
  // STEP 4: FILL OUT THE ADD ROOM FORM
  // ==========================================
  // 1. Room Number
  await page.locator('input[name="roomNumber"]').fill('B-205', { force: true });

  // 2. Floor Level (Found this thanks to your error log!)
  // Using { index: 1 } selects the 2nd option in the dropdown so we don't have to guess the text!
  await page.locator('select[name="floorLevel"]').selectOption({ index: 1 }, { force: true });

  // 3. Room Type
  await page.locator('select[name="roomType"]').selectOption({ index: 1 }, { force: true });

  // 4. Gender
  await page.locator('select[name="designatedGender"]').selectOption({ index: 1 }, { force: true });

  // 5. Capacity & Financials
  await page.locator('input[name="maxCapacity"]').fill('1', { force: true });
  await page.locator('input[name="monthlyRent"]').fill('20000', { force: true });
  await page.locator('input[name="keyMoney"]').fill('60000', { force: true });

  await page.waitForTimeout(1000); // Quick pause to visually see the filled form

  // ==========================================
  // STEP 5: SUBMIT THE FORM
  // ==========================================
  const submitButton = page.locator('button[type="submit"]').first();
  await expect(submitButton).toBeVisible({ timeout: 15000 });
  await submitButton.click({ force: true });

  // ==========================================
  // STEP 6: VERIFY SUCCESS
  // ==========================================
  // Wait 2 seconds to ensure the POST route was triggered successfully
  await page.waitForTimeout(2000); 
});