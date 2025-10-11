import request from 'supertest';
import { connect, clearDatabase, closeDatabase } from './tests.setup.js';
import app from '../server.js';
import { Job } from '../models/jobs.model.js';

const userPayload = {
    username: "job_test_user",
    email: "job.test@example.com",
    password: "Password123!",
    fullName: "Job Test User",
    role: "user"
};

let token;
let createdJobId;

beforeAll(async () => {
    await connect();
})

afterEach(async () => {
    await clearDatabase();
})

afterAll(async () => {
    await closeDatabase();
})

describe('Job Endpoints', () => {
    beforeEach(async () => {
        // Register and login a user to get a token for authenticated requests
        await request(app)
            .post('/api/v1/user/auth/register')
            .send(userPayload);

        const loginRes = await request(app)
            .post('/api/v1/user/auth/login')
            .send({
                username: userPayload.username,
                password: userPayload.password
            });
        token = loginRes.body.accessToken;
    });

    const jobPayload = {
        title: "Software Engineer",
        description: "Develop and maintain web applications.",
        company_name: "Tech Corp",
        company_details: "A leading technology company.",
        location: "San Francisco, CA"
    };

    // Test for CREATE Job
    describe('POST /api/v1/job', () => {
        it('should create a new job for an authenticated user', async () => {
            const res = await request(app)
                .post('/api/v1/job')
                .set('Authorization', `Bearer ${token}`)
                .send(jobPayload)
                .expect(201);

            expect(res.body).toHaveProperty('message', 'Job created successfully');
            expect(res.body).toHaveProperty('job');
            expect(res.body.job.title).toBe(jobPayload.title);
            createdJobId = res.body.job._id;
        });

        it('should return 401 if user is not authenticated', async () => {
            await request(app)
                .post('/api/v1/job')
                .send(jobPayload)
                .expect(401);
        });

        it('should return 409 if a job with the same title, company, and location already exists', async () => {
            // Create the first job
            await request(app)
                .post('/api/v1/job')
                .set('Authorization', `Bearer ${token}`)
                .send(jobPayload);

            // Attempt to create the same job again
            const res = await request(app)
                .post('/api/v1/job')
                .set('Authorization', `Bearer ${token}`)
                .send(jobPayload)
                .expect(409);

            expect(res.body.message).toContain('already exists');
        });

        it('should return 400 for invalid job data', async () => {
            const invalidPayload = { ...jobPayload, title: '' }; // Missing title
            const res = await request(app)
                .post('/api/v1/job')
                .set('Authorization', `Bearer ${token}`)
                .send(invalidPayload)
                .expect(400);

            expect(res.body.message).toContain('"title" is not allowed to be empty');
        });
    });

    // Test for GET all Jobs
    describe('GET /api/v1/job', () => {
        it('should get all jobs', async () => {
            await request(app)
                .post('/api/v1/job')
                .set('Authorization', `Bearer ${token}`)
                .send(jobPayload);

            const res = await request(app)
                .get('/api/v1/job')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(res.body).toHaveProperty('message', 'Jobs fetched successfully');
            expect(res.body.jobs).toBeInstanceOf(Array);
            expect(res.body.jobs.length).toBe(1);
            expect(res.body.jobs[0].title).toBe(jobPayload.title);
        });
    });

    // Test for GET Job by ID
    describe('GET /api/v1/job/:id', () => {
        it('should get a single job by its ID', async () => {
            const createRes = await request(app)
                .post('/api/v1/job')
                .set('Authorization', `Bearer ${token}`)
                .send(jobPayload);
            const jobId = createRes.body.job._id;

            const res = await request(app)
                .get(`/api/v1/job/${jobId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(res.body).toHaveProperty('message', 'Job fetched successfully');
            expect(res.body.job._id).toBe(jobId);
        });

        it('should return 404 for a non-existent job ID', async () => {
            const nonExistentId = '60c72b2f9b1d8c001f8e4c9a'; // A valid but non-existent ObjectId
            await request(app)
                .get(`/api/v1/job/${nonExistentId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(404);
        });
    });

    // Test for UPDATE Job
    describe('PUT /api/v1/job/:id', () => {
        it('should update a job', async () => {
            const createRes = await request(app)
                .post('/api/v1/job')
                .set('Authorization', `Bearer ${token}`)
                .send(jobPayload);
            const jobId = createRes.body.job._id;

            const updatePayload = { ...jobPayload, title: "Senior Software Engineer" };
            const res = await request(app)
                .put(`/api/v1/job/${jobId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updatePayload)
                .expect(200);

            expect(res.body).toHaveProperty('message', 'Job updated successfully');
            expect(res.body.job.title).toBe("Senior Software Engineer");
        });
    });

    // Test for DELETE Job
    describe('DELETE /api/v1/job/:id', () => {
        it('should delete a job', async () => {
            const createRes = await request(app)
                .post('/api/v1/job')
                .set('Authorization', `Bearer ${token}`)
                .send(jobPayload);
            const jobId = createRes.body.job._id;

            const res = await request(app)
                .delete(`/api/v1/job/${jobId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(200);

            expect(res.body).toHaveProperty('message', 'Job deleted successfully');

            // Verify the job is actually deleted
            await request(app)
                .get(`/api/v1/job/${jobId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(404);
        });
    });
});