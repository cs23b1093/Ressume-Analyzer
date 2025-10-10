import request from 'supertest';
import { connect, clearDatabase, closeDatabase } from './tests.setup.js';
import app from '../server.js';
import { User } from '../models/user.model.js';

const userPayload = {
    username: "test_user",
    email: "test.resume@example.com",
    password: "Password123!",
    fullName: "Test User",
    role: "user"
};

const resumePayload = {
    address: "123 Test St, Testville, TS 12345",
    phone: "1234567890",
    email: "test.resume@example.com",
    education: "B.S. in Computer Science, Test University",
    experience: "Software Engineer at TestCorp",
    skills: ["JavaScript", "Node.js", "React", "Testing"],
    projects: ["Test Project 1", "Test Project 2"],
    certifications: ["Certified Test Professional"],
    awards: ["Best Tester Award"],
    references: ["Available upon request"],
    hobbies: ["Testing", "Debugging"],
    languages: ["English"],
    social_media: ["https://linkedin.com/in/testuser"],
    links: ["https://github.com/testuser"],
    summary: "A dedicated test user with extensive experience in software development and testing methodologies.",
    objective: "To excel in software development and testing roles, contributing to innovative projects.",
    achievements: ["Achieved 100% test coverage on a test project"]
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

describe('Resume Endpoints', () => {
    beforeEach(async () => {
        // Create a user and log in to get a token for authenticated requests
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

    describe('POST /api/v1/resume', () => {
        test('should create a new resume for an authenticated user', async () => {
            const res = await request(app)
                .post('/api/v1/resume')
                .set('Authorization', `Bearer ${token}`)
                .send(resumePayload)
                .expect(201);

            expect(res.body).toHaveProperty('message', 'Resume created successfully');
            expect(res.body).toHaveProperty('resume');
            expect(res.body.resume.email).toEqual(resumePayload.email);
            expect(res.body.resume.skills).toEqual(expect.arrayContaining(resumePayload.skills));
        });

        test('should not create a resume if not authenticated', async () => {
            await request(app)
                .post('/api/v1/resume')
                .send(resumePayload)
                .expect(401);
        });

        test('should not create a resume if one already exists for the user', async () => {
            await request(app)
                .post('/api/v1/resume')
                .set('Authorization', `Bearer ${token}`)
                .send(resumePayload)
                .expect(201);

            const res = await request(app)
                .post('/api/v1/resume')
                .set('Authorization', `Bearer ${token}`)
                .send(resumePayload)
                .expect(400);

            expect(res.body).toHaveProperty('message', 'Resume already exists');
        });
    });

    describe('GET /api/v1/resume', () => {
        test('should get the resume for an authenticated user', async () => {
            await request(app)
                .post('/api/v1/resume')
                .set('Authorization', `Bearer ${token}`)
                .send(resumePayload);

            const res = await request(app)
                .get('/api/v1/resume')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(res.body).toHaveProperty('message', 'Resume found successfully');
            expect(res.body).toHaveProperty('resume');
            expect(res.body.resume.email).toEqual(resumePayload.email);
        });

        test('should return 404 if no resume is found', async () => {
            const res = await request(app)
                .get('/api/v1/resume')
                .set('Authorization', `Bearer ${token}`)
                .expect(404);

            expect(res.body).toHaveProperty('message', 'Resume not found in database');
        });
    });
});