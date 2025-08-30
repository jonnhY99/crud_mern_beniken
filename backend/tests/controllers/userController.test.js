import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../../models/User.js';
import { 
  registerUser, 
  loginUser, 
  checkFrequentUser, 
  getFrequentUsers 
} from '../../controllers/userController.js';

const app = express();
app.use(express.json());

// Setup routes for testing
app.post('/register', registerUser);
app.post('/login', loginUser);
app.get('/check-frequent/:email', checkFrequentUser);
app.get('/frequent-users', getFrequentUsers);

describe('User Controller', () => {
  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const userData = testUtils.createTestUser({
        role: 'cliente'
      });
      
      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.password).toBeUndefined();
      expect(response.body.token).toBeDefined();
    });

    it('should not register user with existing email', async () => {
      const userData = testUtils.createTestUser({
        role: 'cliente'
      });
      
      // Create user first
      await User.create({
        ...userData,
        password: await bcrypt.hash(userData.password, 10)
      });

      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/register')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /login', () => {
    beforeEach(async () => {
      const userData = testUtils.createTestUser({
        role: 'cliente'
      });
      await User.create({
        ...userData,
        password: await bcrypt.hash(userData.password, 10)
      });
    });

    it('should login user with correct credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /frequent-check', () => {
    beforeEach(async () => {
      // Create a frequent customer
      await User.create({
        name: 'Frequent Customer',
        email: 'frequent@test.com',
        password: await bcrypt.hash('password', 10),
        role: 'cliente',
        isFrequent: true
      });
    });

    it('should identify frequent customer by name and email', async () => {
      const response = await request(app)
        .get('/check-frequent/frequent@test.com')
        .query({
          name: 'Frequent Customer'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.isFrequent).toBe(true);
      expect(response.body.user.name).toBe('Frequent Customer');
    });

    it('should return false for non-frequent customer', async () => {
      const response = await request(app)
        .get('/check-frequent/regular@test.com')
        .query({
          name: 'Regular Customer'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.isFrequent).toBe(false);
    });

    it('should require both name and email', async () => {
      const response = await request(app)
        .get('/check-frequent/test@test.com')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /frequent-users', () => {
    beforeEach(async () => {
      // Create multiple users
      await User.create([
        {
          name: 'Frequent 1',
          email: 'freq1@test.com',
          password: await bcrypt.hash('password', 10),
          role: 'cliente',
          isFrequent: true
        },
        {
          name: 'Frequent 2',
          email: 'freq2@test.com',
          password: await bcrypt.hash('password', 10),
          role: 'cliente',
          isFrequent: true
        },
        {
          name: 'Admin User',
          email: 'admin@test.com',
          password: await bcrypt.hash('password', 10),
          role: 'admin',
          isFrequent: true
        }
      ]);
    });

    it('should return only frequent customers', async () => {
      const response = await request(app)
        .get('/frequent-users')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.users).toHaveLength(2);
      expect(response.body.users.every(user => 
        user.role === 'cliente' && user.isFrequent === true
      )).toBe(true);
    });
  });
});
