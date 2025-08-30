import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import User from '../../models/User.js';
import Order from '../../models/Order.js';
import Product from '../../models/Product.js';
import bcrypt from 'bcryptjs';

// Import routes
import authRoutes from '../../routes/auth.js';
import orderRoutesFactory from '../../routes/orders.js';
import productRoutesFactory from '../../routes/products.js';
import analyticsRoutesFactory from '../../routes/analytics.js';

// Create Express app for testing
const app = express();
app.use(express.json());
app.use(cors());

// Create mock io for socket events
const ioMock = {
  emit: jest.fn(),
  to: jest.fn(() => ({ emit: jest.fn() }))
};

// Setup routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutesFactory(ioMock));
app.use('/api/products', productRoutesFactory(ioMock));
app.use('/api/analytics', analyticsRoutesFactory(ioMock));

describe('API Integration Tests', () => {
  let authToken;
  let testUser;
  let testProduct;

  beforeEach(async () => {
    // Create test user and get auth token
    testUser = await User.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: await bcrypt.hash('password123', 10),
      role: 'admin'
    });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123'
      });

    authToken = loginResponse.body.token;

    // Create test product with required id
    testProduct = await Product.create({
      id: 'test-product-integration',
      name: 'Test Beef',
      price: 5000,
      stock: 100,
      description: 'Premium beef for testing',
      unit: 'kg',
      isActive: true
    });
  });

  describe('Complete Order Flow', () => {
    it('should handle complete order lifecycle', async () => {
      // 1. Create order
      const orderData = {
        customerName: 'Integration Test Customer',
        customerEmail: 'customer@integration.com',
        customerPhone: '+56987654321',
        products: [
          {
            productId: testProduct._id,
            name: testProduct.name,
            quantity: 2,
            price: testProduct.price
          }
        ],
        totalAmount: testProduct.price * 2,
        deliveryAddress: 'Integration Test Address 456'
      };

      const createResponse = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      const orderId = createResponse.body.order._id;
      expect(createResponse.body.order.status).toBe('pending');

      // 2. Update order status to confirmed
      const confirmResponse = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'confirmed' })
        .expect(200);

      expect(confirmResponse.body.order.status).toBe('confirmed');

      // 3. Update order status to ready
      const readyResponse = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'ready' })
        .expect(200);

      expect(readyResponse.body.order.status).toBe('ready');

      // 4. Complete order
      const completeResponse = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'completed' })
        .expect(200);

      expect(completeResponse.body.order.status).toBe('completed');

      // 5. Verify order in database
      const finalOrder = await Order.findById(orderId);
      expect(finalOrder.status).toBe('completed');
    });

    it('should handle order cancellation', async () => {
      const orderData = testUtils.createTestOrder();
      
      const createResponse = await request(app)
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      const orderId = createResponse.body.order._id;

      const cancelResponse = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'cancelled' })
        .expect(200);

      expect(cancelResponse.body.order.status).toBe('cancelled');
    });
  });

  describe('User Authentication Flow', () => {
    it('should handle user registration and login', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@test.com',
        password: 'newpassword123',
        role: 'cliente'
      };

      // Register user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(registerResponse.body.success).toBe(true);
      expect(registerResponse.body.token).toBeDefined();

      // Login with new user
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.token).toBeDefined();
    });
  });

  describe('Product Management Flow', () => {
    it('should handle product CRUD operations', async () => {
      const productData = {
        name: 'Integration Test Product',
        price: 3000,
        category: 'cerdo',
        stock: 50,
        description: 'Test product for integration'
      };

      // Create product
      const createResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(201);

      const productId = createResponse.body.product._id;

      // Get product
      const getResponse = await request(app)
        .get(`/api/products/${productId}`)
        .expect(200);

      expect(getResponse.body.product.name).toBe(productData.name);

      // Update product
      const updateData = { price: 3500, stock: 45 };
      const updateResponse = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.product.price).toBe(3500);
      expect(updateResponse.body.product.stock).toBe(45);

      // Delete product
      await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify deletion
      await request(app)
        .get(`/api/products/${productId}`)
        .expect(404);
    });
  });

  describe('Analytics Integration', () => {
    beforeEach(async () => {
      // Create test data for analytics
      await Order.create([
        {
          ...testUtils.createTestOrder(),
          status: 'completed',
          totalAmount: 5000,
          createdAt: new Date('2024-01-15')
        },
        {
          ...testUtils.createTestOrder(),
          status: 'completed',
          totalAmount: 7500,
          createdAt: new Date('2024-01-20')
        },
        {
          ...testUtils.createTestOrder(),
          status: 'pending',
          totalAmount: 3000,
          createdAt: new Date('2024-01-25')
        }
      ]);
    });

    it('should return dashboard analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalRevenue).toBeDefined();
      expect(response.body.data.totalOrders).toBeDefined();
      expect(response.body.data.pendingOrders).toBeDefined();
    });

    it('should return stock inventory', async () => {
      const response = await request(app)
        .get('/api/analytics/stock-inventory')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.products)).toBe(true);
    });
  });
});
