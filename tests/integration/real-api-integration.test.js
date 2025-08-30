import { test, expect } from '@playwright/test';

/**
 * Real API Integration Tests
 * These tests run against the actual backend API
 */

test.describe('Real API Integration Tests', () => {
  const API_BASE = 'http://localhost:5000/api';
  let authToken = '';

  test.beforeAll(async ({ request }) => {
    // Setup: Login to get auth token
    const loginResponse = await request.post(`${API_BASE}/auth/login`, {
      data: {
        email: 'admin@beniken.com',
        password: 'admin123'
      }
    });
    
    if (loginResponse.ok()) {
      const loginData = await loginResponse.json();
      authToken = loginData.token;
    }
  });

  test('Products API CRUD operations', async ({ request }) => {
    // Create product
    const newProduct = {
      name: 'Test Product Integration',
      price: 15000,
      category: 'vacuno',
      stock: 25,
      description: 'Product created by integration test'
    };

    const createResponse = await request.post(`${API_BASE}/products`, {
      data: newProduct,
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(createResponse.ok()).toBeTruthy();
    const createdProduct = await createResponse.json();
    const productId = createdProduct._id;

    // Read product
    const getResponse = await request.get(`${API_BASE}/products/${productId}`);
    expect(getResponse.ok()).toBeTruthy();
    const retrievedProduct = await getResponse.json();
    expect(retrievedProduct.name).toBe(newProduct.name);

    // Update product
    const updateData = { price: 18000 };
    const updateResponse = await request.put(`${API_BASE}/products/${productId}`, {
      data: updateData,
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(updateResponse.ok()).toBeTruthy();

    // Verify update
    const updatedProduct = await request.get(`${API_BASE}/products/${productId}`);
    const updatedData = await updatedProduct.json();
    expect(updatedData.price).toBe(18000);

    // Delete product
    const deleteResponse = await request.delete(`${API_BASE}/products/${productId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(deleteResponse.ok()).toBeTruthy();

    // Verify deletion
    const deletedProduct = await request.get(`${API_BASE}/products/${productId}`);
    expect(deletedProduct.status()).toBe(404);
  });

  test('Orders API workflow', async ({ request }) => {
    // Create order
    const orderData = {
      customerName: 'Integration Test Customer',
      customerEmail: 'integration@test.com',
      customerPhone: '+56987654321',
      products: [
        {
          productId: '507f1f77bcf86cd799439011',
          name: 'Test Product',
          quantity: 3,
          price: 10000
        }
      ],
      totalAmount: 30000,
      paymentMethod: 'transferencia'
    };

    const createOrderResponse = await request.post(`${API_BASE}/orders`, {
      data: orderData
    });
    expect(createOrderResponse.ok()).toBeTruthy();
    const createdOrder = await createOrderResponse.json();
    const orderId = createdOrder._id;

    // Get order
    const getOrderResponse = await request.get(`${API_BASE}/orders/${orderId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(getOrderResponse.ok()).toBeTruthy();
    const retrievedOrder = await getOrderResponse.json();
    expect(retrievedOrder.customerName).toBe(orderData.customerName);

    // Update order status
    const statusUpdate = { status: 'en-preparacion' };
    const updateStatusResponse = await request.put(`${API_BASE}/orders/${orderId}/status`, {
      data: statusUpdate,
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(updateStatusResponse.ok()).toBeTruthy();

    // Verify status update
    const updatedOrder = await request.get(`${API_BASE}/orders/${orderId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const updatedOrderData = await updatedOrder.json();
    expect(updatedOrderData.status).toBe('en-preparacion');
  });

  test('User management API', async ({ request }) => {
    // Create user
    const userData = {
      name: 'Integration Test User',
      email: 'integrationuser@test.com',
      role: 'customer',
      phone: '+56911111111'
    };

    const createUserResponse = await request.post(`${API_BASE}/users`, {
      data: userData,
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(createUserResponse.ok()).toBeTruthy();
    const createdUser = await createUserResponse.json();
    const userId = createdUser._id;

    // Get users list
    const getUsersResponse = await request.get(`${API_BASE}/users`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(getUsersResponse.ok()).toBeTruthy();
    const users = await getUsersResponse.json();
    expect(Array.isArray(users)).toBeTruthy();
    expect(users.some(user => user._id === userId)).toBeTruthy();

    // Update user
    const updateUserData = { name: 'Updated Integration User' };
    const updateUserResponse = await request.put(`${API_BASE}/users/${userId}`, {
      data: updateUserData,
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(updateUserResponse.ok()).toBeTruthy();

    // Delete user
    const deleteUserResponse = await request.delete(`${API_BASE}/users/${userId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(deleteUserResponse.ok()).toBeTruthy();
  });

  test('Analytics API integration', async ({ request }) => {
    // Get dashboard data
    const dashboardResponse = await request.get(`${API_BASE}/analytics/dashboard`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(dashboardResponse.ok()).toBeTruthy();
    const dashboardData = await dashboardResponse.json();
    
    expect(dashboardData).toHaveProperty('summary');
    expect(dashboardData).toHaveProperty('charts');
    expect(dashboardData.summary).toHaveProperty('totalOrders');
    expect(dashboardData.summary).toHaveProperty('totalRevenue');

    // Get stock inventory
    const stockResponse = await request.get(`${API_BASE}/analytics/stock-inventory`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    expect(stockResponse.ok()).toBeTruthy();
    const stockData = await stockResponse.json();
    
    expect(stockData).toHaveProperty('inventory');
    expect(stockData).toHaveProperty('summary');
    expect(Array.isArray(stockData.inventory)).toBeTruthy();
  });
});