import request from 'supertest';
import { connect, clearDatabase, closeDatabase } from './tests.setup.js';
import { User } from '../models/user.model.js';
import app from '../server.js';

const userPayload = {
    username: "john_doe_006",
    email: "akps1440240@gmail.com",
    password: "Amitsh99821#",
    fullName: "John Doe",
    role: "user"
};

beforeAll(async () => {
    await connect();
  });
  
  afterEach(async () => {
    await clearDatabase();
  });
  
  afterAll(async () => {
    await closeDatabase();
  });
  

describe("Auth: Register", () => {
    test("should register a new user and not return a password", async () => {
            const res = await request(app)
                        .post('/api/v1/user/auth/register')
                        .send(userPayload)
                        .expect(201);

            expect(res.body).toHaveProperty("message");
            expect(res.body).toHaveProperty("user");

            const user = res.body.user;
            expect(user).not.toHaveProperty("password");
            expect(user).toHaveProperty("_id");
            expect(user).toHaveProperty("username", userPayload.username);
            expect(user).toHaveProperty("email", userPayload.email);

            const dbUser = await User.findOne({ email: userPayload.email });
            expect(dbUser).not.toBeNull();
            expect(dbUser).not.toBe(userPayload.password);
        });
});

describe("Auth: Login", () => {
    beforeEach(async () => {
        const user = new User(userPayload);
        await user.save();
    });

    test("should login an existing user and return tokens", async () => {
        const res = await request(app)
            .post('/api/v1/user/auth/login')
            .send({
                username: userPayload.username,
                password: userPayload.password
            })
            .expect(200);

        expect(res.body).toHaveProperty("message", "User logged in successfully");
        expect(res.body).toHaveProperty("user");
        expect(res.body.user).not.toHaveProperty("password");
        expect(res.body).toHaveProperty("accessToken");
        expect(res.body).toHaveProperty("refreshToken");
    });

    test("should not login with incorrect password", async () => {
        const res = await request(app)
            .post('/api/v1/user/auth/login')
            .send({
                username: userPayload.username,
                password: userPayload.password  + "incorrect"
            })
            .expect(401);

        expect(res.body).toHaveProperty("message", "Internal server error while logging in user: Password is incorrect");
    });

    test("should not login a non-existent user", async () => {
        const res = await request(app)
            .post('/api/v1/user/auth/login')
            .send({
                username: "nonexistentuser",
                password: userPayload.password
            })
            .expect(404);

        expect(res.body).toHaveProperty("message", "Internal server error while logging in user: User not found");
    });
});

describe("Auth: Forgot Password", () => {
    // TODO: Add tests for forgot password once the functionality is implemented
});

describe("Auth: Reset Password", () => {
    let token;

    beforeEach(async () => {
        const user = new User(userPayload);
        await user.save();

        const res = await request(app)
            .post('/api/v1/user/auth/login')
            .send({
                username: userPayload.username,
                password: userPayload.password
            });
        token = res.body.accessToken;
    });

    test("should reset password for an authenticated user", async () => {
        const newPassword = "newpassword123";
        const res = await request(app)
            .put('/api/v1/user/auth/reset-password')
            .set('Authorization', `Bearer ${token}`)
            .send({
                newPassword
            })
            .expect(200);

        expect(res.body).toHaveProperty("message", "Password reset successfully");

        // Verify the password was actually changed
        const res2 = await request(app)
            .post('/api/v1/user/auth/login')
            .send({
                username: userPayload.username,
                password: newPassword
            })
            .expect(200);
        expect(res2.body).toHaveProperty("message", "User logged in successfully");
    });
});