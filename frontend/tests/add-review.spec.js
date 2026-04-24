import { test, expect } from '@playwright/test';

// 1. MOCK SESSION DATA
const studentUser = {
  _id: 'student-123',
  name: 'Nethna Oshad',
  email: 'nethnaoshad@gmail.com',
  role: 'Student',
  profileImage: ''
};

function setupSession(page, user) {
  return page.addInitScript((userInfo) => {
    window.localStorage.setItem('userInfo', JSON.stringify(userInfo));
  }, user);
}

test('Student can write and submit a review', async ({ page }) => {
  // ==========================================
  // STEP 1: MOCK THE BACKEND API
  // ==========================================
  await setupSession(page, studentUser);

  // Mock GET reviews (return empty so our dummy data shows up)
  await page.route('**/api/reviews', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, json: [] });
    } else if (route.request().method() === 'POST') {
      // Mock POST review (Instant success!)
      await route.fulfill({ 
        status: 201, 
        json: { message: 'Review added successfully!' } 
      });
    }
  });

  // Mock the Rooms/Laundry API so the Home page loads cleanly
  await page.route('**/api/rooms', async (route) => {
    await route.fulfill({ status: 200, json: [] });
  });
  await page.route('**/api/laundry/student/**', async (route) => {
    await route.fulfill({ status: 200, json: [] });
  });

  // ==========================================
  // STEP 2: GO DIRECTLY TO HOME PAGE
  // ==========================================
  await page.goto('http://localhost:5173/home');

  // ==========================================
  // STEP 3: OPEN REVIEW MODAL
  // ==========================================
  // Scroll down and find the "Write a Review" button
  const writeReviewBtn = page.getByRole('button', { name: 'Write a Review' });
  await expect(writeReviewBtn).toBeVisible({ timeout: 15000 });
  await writeReviewBtn.click({ force: true });

  // ==========================================
  // STEP 4: FILL OUT THE REVIEW
  // ==========================================
  // Wait for modal to pop up
  const modalHeading = page.getByRole('heading', { name: 'Share Your Experience' });
  await expect(modalHeading).toBeVisible({ timeout: 15000 });

  // Click the 4th star (rating = 4)
  // The stars are SVG elements inside a flex container. We'll target the 4th one.
  const stars = page.locator('form svg');
  await stars.nth(3).click({ force: true });

  // Fill out the text area
  const reviewTextArea = page.locator('textarea[placeholder*="Tell us what you love"]');
  await expect(reviewTextArea).toBeVisible({ timeout: 15000 });
  await reviewTextArea.fill('AuraLive is the best hostel! The smart systems work perfectly.', { force: true });

  await page.waitForTimeout(1000); // Quick pause so panel can see it

  // ==========================================
  // STEP 5: SUBMIT REVIEW
  // ==========================================
  const submitBtn = page.getByRole('button', { name: 'Post Review' });
  await submitBtn.click({ force: true });

  // Wait a moment for the POST request to fire and modal to close
  await page.waitForTimeout(2000);

  // Modal should be gone
  await expect(modalHeading).toBeHidden({ timeout: 15000 });
});