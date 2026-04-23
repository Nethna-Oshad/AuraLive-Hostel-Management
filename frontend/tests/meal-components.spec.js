import { test, expect } from '@playwright/test';

const studentUser = {
  name: 'Test Student',
  email: 'student@test.com',
  role: 'Student',
};

const supplierUser = {
  name: 'Spice Kitchen',
  email: 'supplier@test.com',
  role: 'MealSupplier',
};

function setupSession(page, user) {
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  return page.addInitScript((userInfo) => {
    window.localStorage.setItem('userInfo', JSON.stringify(userInfo));
  }, user);
}

test.describe('Meal Components Specific Features', () => {

  test('MealDashboard (Supplier) allows status updates and filtering', async ({ page }) => {
    await setupSession(page, supplierUser);
    
    const today = new Date().toISOString().split('T')[0];

    await page.route('**/api/meals/supplier/summary*', async (route) => {
      await route.fulfill({
        status: 200,
        json: { todayOrders: 2, pendingOrders: 1, deliveredOrders: 0, unpaidOrders: 0, revenueToday: 1500 },
      });
    });

    await page.route('**/api/meals/supplier/orders*', async (route) => {
      const url = route.request().url();
      if (url.includes('date=')) {
        // Filtered response
        await route.fulfill({
          status: 200,
          json: [
            {
              _id: 'order-1',
              studentName: 'Alice Filtered',
              studentEmail: 'alice@test.com',
              bookingDate: '2023-12-01',
              slotLabel: 'Lunch',
              externalShopName: 'Spice Kitchen',
              externalItems: [{ itemName: 'Fried Rice', quantity: 1 }],
              deliveryStatus: 'Pending',
              paymentStatus: 'Paid',
              status: 'Active',
            }
          ]
        });
      } else {
        // Default response
        await route.fulfill({
          status: 200,
          json: [
            {
              _id: 'order-2',
              studentName: 'Bob Default',
              studentEmail: 'bob@test.com',
              bookingDate: today,
              slotLabel: 'Dinner',
              externalShopName: 'Spice Kitchen',
              externalItems: [{ itemName: 'Kottu', quantity: 1 }],
              deliveryStatus: 'Prepared',
              paymentStatus: 'Paid',
              status: 'Active',
            }
          ],
        });
      }
    });

    await page.route('**/api/meals/supplier/orders/*/delivery-status', async (route) => {
      await route.fulfill({ status: 200, json: { message: 'Updated' } });
    });

    await page.goto('/meal/dashboard');

    // Default view shows Bob
    await expect(page.locator('body')).toContainText('Bob Default');

    // Test status update from Prepared -> Delivered
    const statusDropdown = page.locator('#supplier-delivery-order-2');
    await statusDropdown.selectOption('Delivered');
    await expect(page.locator('body')).toContainText('Delivery status updated.');

    // Test filtering by applying a date
    await page.locator('#supplier-order-date').fill('2023-12-01');
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    
    // Now Alice should be visible and Bob should be gone
    await expect(page.locator('body')).toContainText('Alice Filtered');
  });


  test('MealOrderQrDetails shows valid order and invalid error correctly', async ({ page }) => {
    // Valid Ref
    await page.route('**/api/meals/orders/reference/VALID-123', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          _id: 'order-valid',
          orderReference: 'VALID-123',
          externalShopName: 'Spice Kitchen',
          externalItems: [{ itemName: 'Cheese Kottu', quantity: 2, lineTotal: 1600 }],
          bookingDate: '2023-10-25',
          slotLabel: 'Dinner',
          paymentStatus: 'Paid',
          deliveryStatus: 'Delivered',
          externalAmount: 1600,
          status: 'Active'
        },
      });
    });

    await page.goto('/meal-order/VALID-123');
    
    await expect(page.locator('body')).toContainText('Meal Order Details');
    await expect(page.locator('body')).toContainText('VALID-123');
    await expect(page.locator('body')).toContainText('Spice Kitchen');
    await expect(page.locator('body')).toContainText('Cheese Kottu');
    await expect(page.locator('body')).toContainText('Delivered');
    
    // Invalid Ref
    await page.route('**/api/meals/orders/reference/INVALID-999', async (route) => {
      await route.fulfill({
        status: 404,
        json: { message: 'Order not found' },
      });
    });

    await page.goto('/meal-order/INVALID-999');
    await expect(page.locator('body')).toContainText('Order Not Found');
    await expect(page.locator('body')).toContainText('Order not found');
  });

  test('ThirdPartyMealDashboard shows QR code for Delivered orders', async ({ page }) => {
    await setupSession(page, studentUser);
    
    const today = new Date().toISOString().split('T')[0];

    // Mocks for basic page load
    await page.route('**/api/meals/slots?date=**', async (route) => {
      await route.fulfill({ status: 200, json: { thirdPartyShops: [], isAllSlotsFull: false } });
    });

    // Mock student orders returning one Delivered order
    await page.route('**/api/meals/student/**', async (route) => {
      await route.fulfill({
        status: 200,
        json: [
          {
            _id: 'order-delivered',
            type: 'External',
            externalShopName: 'Spice Kitchen',
            externalItems: [{ itemName: 'Chicken Kottu', quantity: 1, lineTotal: 850 }],
            externalAmount: 850,
            status: 'Active',
            deliveryStatus: 'Delivered',
            paymentStatus: 'Paid',
            bookingDate: today,
            slotLabel: 'Dinner',
            orderReference: 'MY-QR-REF-001'
          },
        ],
      });
    });

    await page.goto('/student/meals/third-party');

    // Click the Completed Orders tab because Delivered orders go there
    await page.getByRole('button', { name: /Completed Orders/i }).click();

    // Wait for the "Collection QR Ready" banner
    await expect(page.locator('body')).toContainText('Collection QR Ready');
    await expect(page.locator('body')).toContainText('MY-QR-REF-001');

    // Verify Download QR button exists
    const downloadBtn = page.getByRole('button', { name: 'Download QR' });
    await expect(downloadBtn).toBeVisible();
    
    // Clicking it shouldn't crash (actually generates a canvas and triggers download, we won't fully assert the file download here but verify it doesn't throw)
    await downloadBtn.click();
  });
});
