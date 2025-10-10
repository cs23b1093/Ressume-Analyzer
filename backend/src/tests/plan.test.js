import request from 'supertest';
import { connect, clearDatabase, closeDatabase } from './tests.setup.js';
import app from '../server.js';

const userPayload = {
  username: "test_user_plan",
  email: "test123.plan@example.com",
  password: "Password123!",
  fullName: "Test User",
  role: "user"
};

const planPayload = {
  plan: 'pro',
  isFreeTrial: true,
  freeTrialDays: 14,
  status: 'active'
};

let token;

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe('Plan Endpoints', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/v1/user/auth/register')
      .send(userPayload);

    const res = await request(app)
      .post('/api/v1/user/auth/login')
      .send({
        username: userPayload.username,
        password: userPayload.password
      });

    token = res.body.accessToken;
  });

  // 🧪 CREATE PLAN
  describe('POST /api/v1/plan', () => {
    test('should create a new plan for an authenticated user', async () => {
      const res = await request(app)
        .post('/api/v1/plan')
        .set('Authorization', `Bearer ${token}`)
        .send(planPayload)
        .expect(201);

      expect(res.body).toHaveProperty('message', 'Plan created successfully');
      expect(res.body).toHaveProperty('plan');
      expect(res.body.plan.plan).toBe('pro');
      expect(res.body.plan.isFreeTrial).toBe(true);
    });

    test('should not create a plan if not authenticated', async () => {
      await request(app)
        .post('/api/v1/plan')
        .send(planPayload)
        .expect(401);
    });

    test('should not create a plan if one already exists for the user', async () => {
      await request(app)
        .post('/api/v1/plan')
        .set('Authorization', `Bearer ${token}`)
        .send(planPayload)
        .expect(201);

      const res = await request(app)
        .post('/api/v1/plan')
        .set('Authorization', `Bearer ${token}`)
        .send(planPayload)
        .expect(400);

      expect(res.body).toHaveProperty('message', 'Plan already exists');
    });
  });

  // 🧪 GET PLAN
  describe('GET /api/v1/plan', () => {
    test('should get the plan for an authenticated user', async () => {
      await request(app)
        .post('/api/v1/plan')
        .set('Authorization', `Bearer ${token}`)
        .send(planPayload);

      const res = await request(app)
        .get('/api/v1/plan')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Plan found successfully');
      expect(res.body).toHaveProperty('plan');
      expect(res.body.plan.plan).toBe('pro');
    });

    test('should return 404 if no plan is found for the user', async () => {
      const res = await request(app)
        .get('/api/v1/plan')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body).toHaveProperty('message', 'Plan not found in database');
    });
  });

  // 🧪 UPDATE PLAN
  describe('PUT /api/v1/plan/update', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/v1/plan')
        .set('Authorization', `Bearer ${token}`)
        .send(planPayload);
    });

    test('should update an existing plan for an authenticated user', async () => {
      const updatePayload = {
        plan: 'free',
        isFreeTrial: false
      };

      const res = await request(app)
        .put('/api/v1/plan/update')
        .set('Authorization', `Bearer ${token}`)
        .send(updatePayload)
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Plan updated successfully');
      expect(res.body.plan.plan).toBe('free');
      expect(res.body.plan.isFreeTrial).toBe(false);
    });
  });
});
