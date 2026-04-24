import { test, expect } from '@playwright/test';

const supplierUser = {
  name: 'Meal Test Supplier',
  email: 'supplier@test.com',
  role: 'MealSupplier',
};

function mealOrder(overrides = {}) {
  return {
    _id: 'order-1',
    studentName: 'Nimal Perera',
    studentEmail: 'nimal@student.com',
    bookingDate: '2026-04-23',
    slotLabel: 'Lunch',
    externalItems: [{ itemName: 'Chicken Rice', quantity: 2 }],
    externalShopName: 'Spice Kitchen',
    paymentStatus: 'Paid',
    deliveryStatus: 'Pending',
    status: 'Active',
    ...overrides,
  };
}

function setupSupplierSession(page) {
  return page.addInitScript((userInfo) => {
    window.localStorage.setItem('userInfo', JSON.stringify(userInfo));
  }, supplierUser);
}

async function mockMealSupplierApis(page, options = {}) {
  const summary = options.summary ?? {
    todayOrders: 4,
    pendingOrders: 2,
    deliveredOrders: 2,
    unpaidOrders: 1,
    revenueToday: 6000,
  };
  const orders = options.orders ?? [mealOrder()];
  let menuItems = options.menuItems ?? [
    {
      _id: 'menu-1',
      itemName: 'Kottu',
      category: 'Main',
      price: 900,
      prepTimeMinutes: 20,
      description: 'Chicken kottu',
      isAvailable: true,
    },
  ];

  await page.route('**/api/meals/supplier/**', async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();

    if (url.pathname.endsWith('/summary') && method === 'GET') {
      await route.fulfill({ status: 200, json: summary });
      return;
    }

    if (url.pathname.endsWith('/orders') && method === 'GET') {
      await route.fulfill({ status: 200, json: orders });
      return;
    }

    if (/\/orders\/[^/]+\/delivery-status$/.test(url.pathname) && method === 'PATCH') {
      await route.fulfill({ status: 200, json: { message: 'updated' } });
      return;
    }

    if (url.pathname.endsWith('/menu') && method === 'GET') {
      await route.fulfill({ status: 200, json: menuItems });
      return;
    }

    if (url.pathname.endsWith('/menu') && method === 'POST') {
      const payload = route.request().postDataJSON();
      menuItems = [
        ...menuItems,
        {
          _id: `menu-${menuItems.length + 1}`,
          ...payload,
        },
      ];
      await route.fulfill({ status: 201, json: { message: 'created' } });
      return;
    }

    if (/\/menu\/[^/]+$/.test(url.pathname) && method === 'DELETE') {
      const id = url.pathname.split('/').pop();
      menuItems = menuItems.filter((item) => item._id !== id);
      await route.fulfill({ status: 200, json: { message: 'deleted' } });
      return;
    }

    if (/\/menu\/[^/]+$/.test(url.pathname) && method === 'PUT') {
      const id = url.pathname.split('/').pop();
      const payload = route.request().postDataJSON();
      menuItems = menuItems.map((item) => (item._id === id ? { ...item, ...payload } : item));
      await route.fulfill({ status: 200, json: { message: 'updated' } });
      return;
    }

    await route.fulfill({ status: 404, json: { message: 'not mocked' } });
  });
}

test.describe('Meal supplier flows', () => {
  test.beforeEach(async ({ page }) => {
    await setupSupplierSession(page);
  });

  test('loads supplier dashboard metrics and order row', async ({ page }) => {
    await mockMealSupplierApis(page);
    await page.goto('/meal/dashboard');

    await expect(page.getByRole('heading', { name: 'Orders Dashboard' })).toBeVisible();
    await expect(page.getByText('Total Orders (Today)')).toBeVisible();
    await expect(page.getByText('Pending Deliveries')).toBeVisible();
    await expect(page.getByText('Nimal Perera')).toBeVisible();
    await expect(page.getByText('Chicken Rice')).toBeVisible();
  });

  test('applies filters and sends filtered request', async ({ page }) => {
    await mockMealSupplierApis(page);
    await page.goto('/meal/dashboard');

    await page.fill('#supplier-order-date', '2026-04-23');
    await page.selectOption('#supplier-filter-delivery', 'Pending');
    await page.selectOption('#supplier-filter-payment', 'Paid');

    const filteredRequest = page.waitForRequest((request) => {
      return (
        request.url().includes('/api/meals/supplier/orders?') &&
        request.url().includes('date=2026-04-23') &&
        request.url().includes('deliveryStatus=Pending') &&
        request.url().includes('paymentStatus=Paid')
      );
    });

    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await filteredRequest;
  });

  test('creates a new menu item from menu management', async ({ page }) => {
    await mockMealSupplierApis(page);
    await page.goto('/meal/menu');

    await expect(page.getByRole('heading', { name: 'Menu Management' })).toBeVisible();
    await page.fill('#menu-item-name', 'Veg Fried Rice');
    await page.fill('#menu-item-category', 'Main');
    await page.fill('#menu-item-price', '750');
    await page.fill('#menu-item-prep', '25');
    await page.fill('#menu-item-description', 'Fresh vegetables and rice');
    await page.getByRole('button', { name: 'Add Item' }).click();

    await expect(page.getByText('Veg Fried Rice')).toBeVisible();
    await expect(page.getByText('Rs. 750')).toBeVisible();
  });

  test('shows insight KPIs and top ordered items', async ({ page }) => {
    const orders = [
      mealOrder({ _id: 'o1', externalItems: [{ itemName: 'Nasi Goreng', quantity: 3 }] }),
      mealOrder({ _id: 'o2', externalItems: [{ itemName: 'Chicken Rice', quantity: 1 }] }),
    ];
    await mockMealSupplierApis(page, {
      summary: {
        todayOrders: 5,
        pendingOrders: 1,
        deliveredOrders: 4,
        unpaidOrders: 0,
        revenueToday: 8000,
      },
      orders,
    });

    await page.goto('/meal/insights');

    await expect(page.getByRole('heading', { name: '3rd Party Business Insights' })).toBeVisible();
    await expect(page.getByText('80%')).toBeVisible();
    await expect(page.getByText('Rs. 2000')).toBeVisible();
    await expect(page.getByText('Nasi Goreng')).toBeVisible();
    await expect(page.getByText('3 orders')).toBeVisible();
  });
});
