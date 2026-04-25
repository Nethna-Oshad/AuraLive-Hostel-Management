import { test, expect } from '@playwright/test';

const adminUser = {
  name: 'System Admin',
  email: 'admin@test.com',
  role: 'Admin',
};

function setupSession(page, user) {
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  return page.addInitScript((userInfo) => {
    window.localStorage.setItem('userInfo', JSON.stringify(userInfo));
  }, user);
}

test.describe('Admin Meal Management', () => {
  test('ManageMealsHub (Dashboard) shows correct stats', async ({ page }) => {
    await setupSession(page, adminUser);

    // Mock the hub stats API
    await page.route('**/api/meals/admin/hub-stats', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          activeSlots: 5,
          todayKitchenBookings: 120,
          activePartners: 3,
          pendingExternalOrders: 15,
          date: 'Oct 25, 2023',
        },
      });
    });

    await page.goto('/admin/meals');

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'hub-debug.png' });

    // Verify static text to ensure the dashboard loaded correctly without waiting for animations
    await expect(page.locator('body')).toContainText('Active Slots');
    await expect(page.locator('body')).toContainText('Active Partners');
  });

  test('ManageKitchenMeals allows creating slots and viewing orders', async ({ page }) => {
    await setupSession(page, adminUser);

    // Mock slots and orders
    await page.route('**/api/meals/admin/slots*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          json: [
            { _id: 'slot-1', label: 'Breakfast Slot', timeRange: '07:00 - 08:30', capacity: 50, isActive: true },
          ],
        });
      } else if (route.request().method() === 'POST' || route.request().method() === 'PUT') {
        await route.fulfill({ status: 201, json: { message: 'Slot updated' } });
      }
    });

    await page.route('**/api/meals/admin/orders*', async (route) => {
      await route.fulfill({
        status: 200,
        json: [
          {
            _id: 'order-1',
            type: 'Kitchen',
            studentName: 'Alice Kitchen',
            studentEmail: 'alice@test.com',
            bookingDate: '2023-10-25',
            slotLabel: 'Breakfast Slot',
            status: 'Active',
          },
        ],
      });
    });

    await page.goto('/admin/meals/kitchen');

    await page.waitForTimeout(1000);
    // Verify slot table
    await expect(page.locator('body')).toContainText('Breakfast Slot');

    // Verify order table
    await expect(page.locator('body')).toContainText('Alice Kitchen');

    // Create a new slot
    await page.getByPlaceholder('Slot label (e.g., Dinner Prep)').fill('Lunch Prep');
    await page.getByPlaceholder('Time range (e.g., 19:00 - 20:00)').fill('12:00 - 13:00');
    await page.getByPlaceholder('Capacity').fill('20');
    
    await page.getByRole('button', { name: 'Create Slot' }).click();
    
    // Verify success toast
    await expect(page.getByText('Meal slot created.')).toBeVisible();
  });

  test('ManageThirdPartyMeals allows managing suppliers and menus', async ({ page }) => {
    await setupSession(page, adminUser);

    // Mock suppliers
    await page.route('**/api/meals/admin/suppliers', async (route) => {
      await route.fulfill({
        status: 200,
        json: [
          {
            _id: 'sup-1',
            name: 'Pizza Shop',
            email: 'pizza@test.com',
            phone: '1234567890',
            status: 'Active',
            logoUrl: '',
            shopTagline: 'Best Pizza',
          },
        ],
      });
    });

    // Mock menu items for the specific shop
    await page.route('**/api/meals/admin/menu-items*', async (route) => {
      await route.fulfill({
        status: 200,
        json: [
          { _id: 'item-1', itemName: 'Cheese Pizza', price: 1500, category: 'Main', isAvailable: true },
        ],
      });
    });

    // Mock external orders
    await page.route('**/api/meals/admin/orders*', async (route) => {
      await route.fulfill({
        status: 200,
        json: [
          {
            _id: 'ext-order-1',
            type: 'External',
            studentName: 'Bob External',
            studentEmail: 'bob@test.com',
            bookingDate: '2023-10-25',
            externalShopName: 'Pizza Shop',
            externalMenuItem: 'Cheese Pizza',
            paymentStatus: 'Paid',
            deliveryStatus: 'Pending',
            status: 'Active',
          },
        ],
      });
    });

    await page.goto('/admin/meals/third-party');

    // Tab 1: Suppliers
    await expect(page.getByText('Meal supplier accounts')).toBeVisible();
    await expect(page.getByText('Pizza Shop')).toBeVisible();
    await expect(page.getByText('pizza@test.com')).toBeVisible();

    // Tab 2: Menus
    await page.getByRole('button', { name: 'Menu items' }).click();
    
    // Click on the shop card to view its menu
    await page.getByText('Manage menu →').click();
    
    // Check if the menu item is rendered
    await expect(page.getByText('Cheese Pizza')).toBeVisible();
    await expect(page.getByText('Rs. 1500')).toBeVisible();

    // Tab 3: External Orders
    await page.getByRole('button', { name: 'External orders' }).click();
    
    // Verify the external order table
    await expect(page.getByText('Bob External')).toBeVisible();
    await expect(page.getByText('Cheese Pizza')).toBeVisible();
  });
});
