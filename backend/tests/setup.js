import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

// Setup before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear database between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Force close connections to prevent memory leaks
afterAll(async () => {
  await mongoose.connection.close();
});

// Global test utilities
global.testUtils = {
  createTestUser: (overrides = {}) => ({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'cliente',
    ...overrides
  }),
  
  createTestProduct: (overrides = {}) => ({
    id: 'test-product-1',
    name: 'Test Product',
    price: 1000,
    stock: 10,
    description: 'Test description',
    unit: 'kg',
    isActive: true,
    ...overrides
  }),
  
  createTestOrder: (overrides = {}) => {
    const orderId = `test-order-${Date.now()}`;
    return {
      id: orderId,
      customerName: 'Test Customer',
      customerEmail: 'customer@test.com',
      customerPhone: '+56912345678',
      items: [
        {
          productId: 'test-product-1',
          name: 'Test Product',
          quantity: 1,
          unit: 'kg',
          price: 1000
        }
      ],
      totalCLP: 1000,
      status: 'Pendiente',
      paymentMethod: 'transfer',
      shippingAddress: 'Test Address 123',
      paid: false,
      reviewed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };
  }
