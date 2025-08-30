// Test models without database connection for now
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

describe('Models Structure', () => {
  test('User model should be defined', () => {
    expect(User).toBeDefined();
    expect(typeof User).toBe('function');
  });

  test('Product model should be defined', () => {
    expect(Product).toBeDefined();
    expect(typeof Product).toBe('function');
  });

  test('Order model should be defined', () => {
    expect(Order).toBeDefined();
    expect(typeof Order).toBe('function');
  });

  test('User schema should have required fields', () => {
    const userSchema = User.schema;
    expect(userSchema.paths.name).toBeDefined();
    expect(userSchema.paths.email).toBeDefined();
    expect(userSchema.paths.password).toBeDefined();
    expect(userSchema.paths.role).toBeDefined();
  });

  test('Product schema should have required fields', () => {
    const productSchema = Product.schema;
    expect(productSchema.paths.id).toBeDefined();
    expect(productSchema.paths.name).toBeDefined();
    expect(productSchema.paths.price).toBeDefined();
  });

  test('Order schema should have required fields', () => {
    const orderSchema = Order.schema;
    expect(orderSchema.paths.id).toBeDefined();
    expect(orderSchema.paths.totalCLP).toBeDefined();
    expect(orderSchema.paths.items).toBeDefined();
  });
});