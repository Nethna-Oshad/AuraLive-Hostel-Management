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
  return page.addInitScript((userInfo) => {
    window.localStorage.setItem('userInfo', JSON.stringify(userInfo));
  }, user);
}

test.describe('Full 3rd Party Meal Workflow', () => {
  let orderId = 'order-123';

  test('Student places an order and Supplier accepts it', async ({ page }) => {
    // --- STUDENT FLOW ---
    await setupSession(page, studentUser);

    await page.route('**/api/meals/slots?date=**', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          thirdPartyShops: [{ name: 'Spice Kitchen', eta: '30 mins', logoUrl: '' }],
          isAllSlotsFull: true,
        },
      });
    });

    await page.route('**/api/meals/student/**', async (route) => {
      await route.fulfill({ status: 200, json: [] });
    });

    await page.route('**/api/meals/public/menu?supplierName=**', async (route) => {
      await route.fulfill({
        status: 200,
        json: [{ _id: 'item-1', itemName: 'Chicken Kottu', price: 850 }],
      });
    });

    await page.route('**/api/meals/order-external-cart', async (route) => {
      await route.fulfill({ status: 201, json: { message: 'Order created' } });
    });

    await page.goto('/student/meals/third-party');

    const today = new Date().toISOString().split('T')[0];
    await page.fill('#meal-date', today);

    await page.getByRole('button', { name: 'Spice Kitchen' }).click();

    await page.getByRole('button', { name: 'Add to Cart' }).first().click();
    await expect(page.getByText('Chicken Kottu added to cart.')).toBeVisible();

    // Close shop menu modal
    await page.getByRole('button', { name: 'Close menu popup' }).click();

    // Open cart and place order
    await page.locator('button', { hasText: 'Cart (1)' }).click(); 
    await page.getByRole('button', { name: 'Checkout' }).click();
    await expect(page.getByText('Cart order created successfully.')).toBeVisible();

    // Mock orders to show the newly created order
    await page.route('**/api/meals/student/**', async (route) => {
      await route.fulfill({
        status: 200,
        json: [
          {
            _id: orderId,
            type: 'External',
            externalShopName: 'Spice Kitchen',
            externalItems: [{ itemName: 'Chicken Kottu', quantity: 1, lineTotal: 850 }],
            externalAmount: 850,
            status: 'Active',
            deliveryStatus: 'AwaitingAcceptance',
            paymentStatus: 'Unpaid',
            bookingDate: today,
            slotLabel: 'Dinner',
          },
        ],
      });
    });

    await page.reload();
    await expect(page.getByText('Payment: Unpaid')).toBeVisible();

    // --- SUPPLIER FLOW ---
    await setupSession(page, supplierUser);

    await page.route('**/api/meals/supplier/summary**', async (route) => {
      await route.fulfill({
        status: 200,
        json: { todayOrders: 1, pendingOrders: 1, deliveredOrders: 0, unpaidOrders: 1, revenueToday: 0 },
      });
    });

    await page.route('**/api/meals/supplier/orders**', async (route) => {
      await route.fulfill({
        status: 200,
        json: [
          {
            _id: orderId,
            studentName: 'Test Student',
            studentEmail: 'student@test.com',
            bookingDate: today,
            slotLabel: 'Dinner',
            externalShopName: 'Spice Kitchen',
            externalItems: [{ itemName: 'Chicken Kottu', quantity: 1 }],
            deliveryStatus: 'AwaitingAcceptance',
            paymentStatus: 'Unpaid',
            status: 'Active',
          },
        ],
      });
    });

    await page.route('**/api/meals/supplier/orders/*/delivery-status', async (route) => {
      await route.fulfill({ status: 200, json: { message: 'Updated' } });
    });

    await page.goto('/meal/dashboard');
    await expect(page.getByText('Test Student')).toBeVisible();

    const statusDropdown = page.locator(`#supplier-delivery-${orderId}`);
    await statusDropdown.selectOption('Pending');
    await expect(page.getByText('Delivery status updated.')).toBeVisible();

    // --- STUDENT PAYMENT FLOW ---
    await setupSession(page, studentUser);

    await page.route('**/api/meals/student/**', async (route) => {
      await route.fulfill({
        status: 200,
        json: [
          {
            _id: orderId,
            type: 'External',
            externalShopName: 'Spice Kitchen',
            externalItems: [{ itemName: 'Chicken Kottu', quantity: 1, lineTotal: 850 }],
            externalAmount: 850,
            status: 'Active',
            deliveryStatus: 'Pending', // It is now accepted
            paymentStatus: 'Unpaid',
            bookingDate: today,
            slotLabel: 'Dinner',
          },
        ],
      });
    });

    await page.route('**/api/payment/create-meal-checkout-session', async (route) => {
      await route.fulfill({ status: 200, json: { url: 'https://checkout.stripe.com/fake' } });
    });

    await page.goto('/student/meals/third-party');
    
    // Now that it's Pending, 'Pay Now' should be visible
    const payButton = page.getByRole('button', { name: 'Pay Now' });
    await expect(payButton).toBeVisible();
  });

  test('Supplier cannot start preparation until paid', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];
    await setupSession(page, supplierUser);

    await page.route('**/api/meals/supplier/orders**', async (route) => {
      await route.fulfill({
        status: 200,
        json: [
          {
            _id: orderId,
            studentName: 'Test Student',
            studentEmail: 'student@test.com',
            bookingDate: today,
            slotLabel: 'Dinner',
            externalShopName: 'Spice Kitchen',
            externalItems: [{ itemName: 'Chicken Kottu', quantity: 1 }],
            deliveryStatus: 'Pending',
            paymentStatus: 'Unpaid',
            status: 'Active',
          },
        ],
      });
    });

    await page.route('**/api/meals/supplier/summary**', async (route) => {
      await route.fulfill({
        status: 200,
        json: { todayOrders: 1, pendingOrders: 1, deliveredOrders: 0, unpaidOrders: 1, revenueToday: 0 },
      });
    });

    await page.goto('/meal/dashboard');

    await expect(page.getByText('Test Student')).toBeVisible();

    const statusDropdown = page.locator(`#supplier-delivery-${orderId}`);
    
    // It should be disabled because it's Unpaid and not AwaitingAcceptance
    await expect(statusDropdown).toBeDisabled();
  });
});
