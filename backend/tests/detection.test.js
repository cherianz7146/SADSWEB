/**
 * Detection Controller Tests
 * Tests for detection creation and listing
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/user');
const Detection = require('../models/detection');

// Mock the server listen to prevent actual server start in tests
if (app.listen) {
  const originalListen = app.listen;
  app.listen = function() {
    return { close: () => {} };
  };
}

// Test database connection
const TEST_MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/sads-test';

describe('Detection API', () => {
  let authToken;
  let userId;
  let adminToken;
  let adminId;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(TEST_MONGODB_URI);
    }
  });

  afterAll(async () => {
    // Clean up test database
    await Detection.deleteMany({});
    await User.deleteMany({ email: /test@/ });
    // Wait for any pending async operations
    await new Promise(resolve => setTimeout(resolve, 500));
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up before each test
    await Detection.deleteMany({});
    await User.deleteMany({ email: /testmanager@|testadmin@/ });

    // Create test manager user
    const managerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Manager',
        email: 'testmanager@example.com',
        password: 'TestPassword123'
      });

    // Ensure registration was successful
    if (managerResponse.status !== 201) {
      console.error('Manager registration failed:', managerResponse.body);
      throw new Error('Failed to create test manager user');
    }
    
    authToken = managerResponse.body.token;
    userId = managerResponse.body.user?.id || managerResponse.body.user?._id;
    
    // If still undefined, get from database
    if (!userId) {
      const user = await User.findOne({ email: 'testmanager@example.com' });
      if (user) {
        userId = user._id?.toString() || user.id?.toString();
      } else {
        throw new Error('Test manager user not found in database');
      }
    }
    
    // Ensure we have both token and userId
    if (!authToken || !userId) {
      throw new Error(`Missing auth data - token: ${!!authToken}, userId: ${!!userId}`);
    }

    // Create test admin user
    const adminUser = await User.create({
      name: 'Test Admin',
      email: 'testadmin@example.com',
      password: require('bcryptjs').hashSync('TestPassword123', 10),
      role: 'admin'
    });

    // Login as admin to get token
    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testadmin@example.com',
        password: 'TestPassword123'
      });

    adminToken = adminLoginResponse.body.token;
    adminId = adminUser._id?.toString() || adminUser.id?.toString();
  });

  describe('POST /api/detections', () => {
    it('should create a detection successfully', async () => {
      const response = await request(app)
        .post('/api/detections')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          label: 'elephant',
          probability: 0.85,
          source: 'browser-camera',
          detectedAt: new Date().toISOString()
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('_id');
      expect(response.body.label).toBe('elephant');
      expect(response.body.probability).toBe(0.85);
      // userId might be ObjectId or string, so check both
      const responseUserId = response.body.userId?.toString() || response.body.userId;
      const expectedUserId = userId?.toString() || userId;
      expect(responseUserId).toBe(expectedUserId);
    });

    it('should reject detection without label', async () => {
      const response = await request(app)
        .post('/api/detections')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          probability: 0.85
          // Missing label
        });

      expect(response.status).toBe(400);
    });

    it('should reject detection without probability', async () => {
      const response = await request(app)
        .post('/api/detections')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          label: 'elephant'
          // Missing probability
        });

      expect(response.status).toBe(400);
    });

    it('should reject detection without authentication', async () => {
      const response = await request(app)
        .post('/api/detections')
        .send({
          label: 'elephant',
          probability: 0.85
        });

      expect(response.status).toBe(401);
    });

    it('should create detection with location', async () => {
      const response = await request(app)
        .post('/api/detections')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          label: 'tiger',
          probability: 0.92,
          source: 'browser-camera',
          location: 'North Zone'
        });

      expect(response.status).toBe(201);
      expect(response.body.location).toBe('North Zone');
    });
  });

  describe('GET /api/detections', () => {
    beforeEach(async () => {
      // Create test detections
      await Detection.create([
        {
          userId: userId,
          label: 'elephant',
          probability: 0.85,
          source: 'browser-camera',
          detectedAt: new Date()
        },
        {
          userId: userId,
          label: 'tiger',
          probability: 0.92,
          source: 'browser-camera',
          detectedAt: new Date()
        }
      ]);
    });

    it('should list detections for manager', async () => {
      const response = await request(app)
        .get('/api/detections')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter detections by user for manager', async () => {
      // Create detection for another user
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@example.com',
        password: require('bcryptjs').hashSync('password', 10)
      });

      await Detection.create({
        userId: otherUser._id,
        label: 'deer',
        probability: 0.75,
        source: 'browser-camera'
      });

      const response = await request(app)
        .get('/api/detections')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // Manager should only see their own detections
      const expectedUserIdStr = userId?.toString() || userId;
      const allOwnDetections = response.body.data.every(d => {
        const detUserId = d.userId?.toString() || d.userId?._id?.toString() || d.userId;
        return detUserId === expectedUserIdStr;
      });
      expect(allOwnDetections).toBe(true);
    });

    it('should list all detections for admin', async () => {
      // Create detection for another user
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other2@example.com',
        password: require('bcryptjs').hashSync('password', 10)
      });

      await Detection.create({
        userId: otherUser._id,
        label: 'deer',
        probability: 0.75,
        source: 'browser-camera'
      });

      const response = await request(app)
        .get('/api/detections')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      // Admin should see all detections
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/detections?limit=1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(1);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/detections');

      expect(response.status).toBe(401);
    });
  });
});

