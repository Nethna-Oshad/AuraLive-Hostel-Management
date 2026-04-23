import { test, expect } from '@playwright/test';

test.describe('Meal supplier registration', () => {
  test('shows password mismatch validation', async ({ page }) => {
    await page.goto('/register/meal');

    await page.fill('#meal-supplier-name', 'Supplier One');
    await page.fill('#meal-supplier-email', 'supplier1@example.com');
    await page.fill('#meal-supplier-phone', '0771234567');
    await page.fill('#meal-supplier-password', 'secret123');
    await page.fill('#meal-supplier-confirm-password', 'secret456');
    await page.getByRole('button', { name: 'Register as Supplier' }).click();

    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });

  test('registers meal supplier and redirects to dashboard', async ({ page }) => {
    await page.route('**/api/auth/register-meal-supplier', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          name: 'Supplier One',
          email: 'supplier1@example.com',
          role: 'MealSupplier',
          token: 'fake-token',
        },
      });
    });

    await page.route('**/api/meals/supplier/orders**', async (route) => {
      await route.fulfill({ status: 200, json: [] });
    });
    await page.route('**/api/meals/supplier/summary**', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          todayOrders: 0,
          pendingOrders: 0,
          deliveredOrders: 0,
          unpaidOrders: 0,
          revenueToday: 0,
        },
      });
    });

    await page.goto('/register/meal');

    await page.fill('#meal-supplier-name', 'Supplier One');
    await page.fill('#meal-supplier-email', 'supplier1@example.com');
    await page.fill('#meal-supplier-phone', '0771234567');
    await page.fill('#meal-supplier-password', 'secret123');
    await page.fill('#meal-supplier-confirm-password', 'secret123');
    await page.getByRole('button', { name: 'Register as Supplier' }).click();

    await expect(page).toHaveURL(/\/meal\/dashboard$/);
    await expect(page.getByRole('heading', { name: 'Orders Dashboard' })).toBeVisible();
  });
});
