import request from 'supertest';
import express from 'express';
import { createOrder, getOrders, updateOrderStatus, getOrderById } from '../../controllers/orderController.js';
import Order from '../../models/Order.js';
import Product from '../../models/Product.js';

const app = express();
app.use(express.json());

// Setup routes for testing
app.post('/orders', createOrder);
app.get('/orders', getOrders);
app.put('/orders/:id/status', updateOrderStatus);
app.get('/orders/:id', getOrderById);

describe('Order Controller', () => {
  let testProduct;

  beforeEach(async () => {
    // Create test product with required id
    testProduct = await Product.create(testUtils.createTestProduct({
      id: 'test-product-1'
    }));
  });

  describe('POST /orders', () => {
    it('should create a new order successfully', async () => {
      const orderData = {
        id: 'test-order-create',
        customerName: 'Test Customer',
        customerEmail: 'customer@test.com',
        customerPhone: '+56912345678',
        items: [
          {
            productId: testProduct.id,
            name: testProduct.name,
            quantity: 2,
            unit: 'kg',
            price: testProduct.price
          }
        ],
        totalCLP: testProduct.price * 2
      };

      const response = await request(app)
        .post('/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.customerName).toBe(orderData.customerName);
      expect(response.body.order.products).toHaveLength(1);
      expect(response.body.order.status).toBe('pending');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/orders')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should calculate total amount correctly', async () => {
      const orderData = {
        customerName: 'Test Customer',
        customerEmail: 'customer@test.com',
        products: [
          {
            productId: testProduct._id,
            name: testProduct.name,
            quantity: 3,
            price: testProduct.price
          }
        ],
        totalAmount: testProduct.price * 3
      };

      const response = await request(app)
        .post('/orders')
        .send(orderData)
        .expect(201);

      expect(response.body.order.totalAmount).toBe(testProduct.price * 3);
    });
  });

  describe('GET /orders', () => {
    beforeEach(async () => {
      await Order.create([
        testUtils.createTestOrder({ status: 'pending' }),
        testUtils.createTestOrder({ status: 'confirmed' }),
        testUtils.createTestOrder({ status: 'completed' })
      ]);
    });

    it('should return all orders', async () => {
      const response = await request(app)
        .get('/orders')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.orders).toHaveLength(3);
    });

    it('should filter orders by status', async () => {
      const response = await request(app)
        .get('/orders')
        .query({ status: 'pending' })
        .expect(200);

      expect(response.body.orders).toHaveLength(1);
      expect(response.body.orders[0].status).toBe('pending');
    });
  });

  describe('PUT /orders/:id/status', () => {
    let testOrder;

    beforeEach(async () => {
      testOrder = await Order.create(testUtils.createTestOrder());
    });

    it('should update order status successfully', async () => {
      const response = await request(app)
        .put(`/orders/${testOrder._id}/status`)
        .send({ status: 'confirmed' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.order.status).toBe('confirmed');
    });

    it('should validate status values', async () => {
      const response = await request(app)
        .put(`/orders/${testOrder._id}/status`)
        .send({ status: 'invalid_status' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle non-existent order', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .put(`/orders/${fakeId}/status`)
        .send({ status: 'confirmed' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /orders/:id', () => {
    let testOrder;

    beforeEach(async () => {
      testOrder = await Order.create(testUtils.createTestOrder());
    });

    it('should return order by id', async () => {
      const response = await request(app)
        .get(`/orders/${testOrder._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.order._id.toString()).toBe(testOrder._id.toString());
    });

    it('should handle non-existent order', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/orders/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
