import { test, expect } from '@playwright/test';

const studentUser = {
  _id: 'student-1',
  name: 'Test Student',
  email: 'student@test.com',
  role: 'Student',
};

function setupSession(page, user) {
  return page.addInitScript((userInfo) => {
    window.localStorage.setItem('userInfo', JSON.stringify(userInfo));
  }, user);
}

test('Student completes the full room booking journey', async ({ page }) => {
  const roomId = 'room-1';

  await setupSession(page, studentUser);

  await page.route('**/api/rooms', async (route) => {
    await route.fulfill({
      status: 200,
      json: [
        {
          _id: roomId,
          roomNumber: 'A-101',
          roomType: 'Single',
          designatedGender: 'Male',
          display: true,
          monthlyRent: 18000,
          keyMoney: 25000,
          maxCapacity: 1,
          currentOccupancy: 0,
          status: 'Available',
          airConditioning: 'AC',
          bathroomType: 'Attached',
          description: 'Quiet single room',
        },
      ],
    });
  });

  await page.route('**/api/laundry/student/**', async (route) => {
    await route.fulfill({ status: 200, json: [] });
  });

  await page.route('**/api/bookings', async (route) => {
    const payload = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      json: {
        message: 'Booking created',
        booking: {
          ...payload,
          _id: 'booking-1',
          status: 'Pending',
        },
      },
    });
  });

  await page.goto('/home');

  // ==========================================
  // STEP 2: FIND A ROOM & CLICK BOOK
  // ==========================================
  await expect(page.getByRole('heading', { name: 'Available Accommodations' })).toBeVisible();
  await page.getByRole('heading', { name: 'Available Accommodations' }).scrollIntoViewIfNeeded();
  
  const bookButton = page.locator('button:has-text("Book This Room"):not([disabled])').first();
  await expect(bookButton).toBeVisible();
  await bookButton.click();
  await expect(page).toHaveURL(new RegExp(`/book/${roomId}$`));
  await page.getByRole('button', { name: 'Secure this Room' }).click();
  await expect(page).toHaveURL(new RegExp(`/booking/${roomId}$`));

  // ==========================================
  // STEP 3: ACCEPT HOSTEL RULES AGREEMENT
  // ==========================================
  await page.locator('#agree').check();
  await page.getByRole('button', { name: 'Proceed to Booking Details' }).click();
  await expect(page.getByText('Student Information')).toBeVisible();

  // ==========================================
  // STEP 4: FILL OUT STUDENT INFORMATION
  // ==========================================
  await page.getByPlaceholder('e.g. 200112345678 or 991234567v').fill('200112345678');
  await page.getByPlaceholder('Guardian Name').fill('Kamal Perera');
  await page.getByPlaceholder('07X XXX XXXX').fill('0771234567');
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  await page.locator('input[name="expectedMoveInDate"]').fill(tomorrow);
  await page.getByPlaceholder('Any medical conditions or specific requirements?').fill('No special requests, thank you.');

  // ==========================================
  // STEP 5: SUBMIT THE BOOKING
  // ==========================================
  await page.locator('button', { hasText: 'Confirm & Submit Booking' }).click();
  await expect(page.getByText('Booking Submitted!')).toBeVisible();
  await expect(page.getByText('Room A-101')).toBeVisible();
});