import { test, expect } from '@playwright/test';

test.describe('API Integration Tests', () => {
  const API_BASE = 'http://localhost:5000/api';
  
  test('API endpoints respond correctly', async ({ request }) => {
    // Test health check
    const health = await request.get(`${API_BASE}/health`);
    expect(health.ok()).toBeTruthy();
    
    // Test products endpoint
    const products = await request.get(`${API_BASE}/products`);
    expect(products.ok()).toBeTruthy();
    const productsData = await products.json();
    expect(Array.isArray(productsData)).toBeTruthy();
  });

  test('Order creation flow works end-to-end', async ({ page, request }) => {
    // Step 1: Create order via API
    const orderData = {
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      customerPhone: '+56912345678',
      products: [
        {
          productId: '507f1f77bcf86cd799439011',
          name: 'Lomo Liso',
          quantity: 2,
          price: 8000
        }
      ],
      totalAmount: 16000,
      paymentMethod: 'efectivo'
    };

    const createOrder = await request.post(`${API_BASE}/orders`, {
      data: orderData
    });
    expect(createOrder.ok()).toBeTruthy();
    const orderResponse = await createOrder.json();
    const orderId = orderResponse._id;

    // Step 2: Verify order appears in admin panel
    await page.goto('/admin/login');
    await page.getByLabel(/email/i).fill('admin@beniken.com');
    await page.getByLabel(/contraseña/i).fill('admin123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    await page.getByRole('link', { name: /pedidos/i }).click();
    await expect(page.getByText('Test Customer')).toBeVisible();

    // Step 3: Update order status via UI
    await page.getByTestId(`order-${orderId}`).click();
    await page.getByLabel(/estado/i).selectOption('completado');
    await page.getByRole('button', { name: /actualizar/i }).click();

    // Step 4: Verify status updated via API
    const updatedOrder = await request.get(`${API_BASE}/orders/${orderId}`);
    expect(updatedOrder.ok()).toBeTruthy();
    const updatedOrderData = await updatedOrder.json();
    expect(updatedOrderData.status).toBe('completado');
  });

  test('Authentication flow works correctly', async ({ page, request }) => {
    // Test login via API
    const loginResponse = await request.post(`${API_BASE}/auth/login`, {
      data: {
        email: 'admin@beniken.com',
        password: 'admin123'
      }
    });
    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    expect(loginData.token).toBeDefined();

    // Test protected endpoint with token
    const protectedResponse = await request.get(`${API_BASE}/admin/dashboard`, {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    expect(protectedResponse.ok()).toBeTruthy();

    // Test UI login with same credentials
    await page.goto('/admin/login');
    await page.getByLabel(/email/i).fill('admin@beniken.com');
    await page.getByLabel(/contraseña/i).fill('admin123');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    await expect(page).toHaveURL(/.*\/admin/);
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });
});