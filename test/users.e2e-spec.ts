// ---------------------------------------------------------------------
// <copyright file="users.e2e-spec.ts" company="Code Inbound LLP">
// Copyright (c) Code Inbound LLP. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let createdUserId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Register and login to get token
    const uniqueEmail = `testuser${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Test User',
        email: uniqueEmail,
        password: 'password123',
      });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: uniqueEmail,
        password: 'password123',
      });

    expect(loginResponse.status).toBe(201);
    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users', () => {
    it('should create a user successfully', () => {
      const uniqueEmail = `newuser${Date.now()}@example.com`;
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'New User',
          email: uniqueEmail,
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.status).toBe(true);
          expect(res.body.message).toBe('User created successfully');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.name).toBe('New User');
          expect(res.body.data.email).toBe(uniqueEmail);
          expect(res.body.data).not.toHaveProperty('password');
          createdUserId = res.body.data.id;
        });
    });

    it('should return error when email already exists', async () => {
      const duplicateEmail = `duplicate${Date.now()}@example.com`;
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'First',
          email: duplicateEmail,
          password: 'password123',
        });

      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Second',
          email: duplicateEmail,
          password: 'password123',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.status).toBe(false);
          expect(res.body.message).toBe('Email already in use');
        });
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Test',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(401);
    });
  });

  describe('GET /users', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'User 1',
          email: `user1${Date.now()}@example.com`,
          password: 'password123',
        });
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'User 2',
          email: `user2${Date.now()}@example.com`,
          password: 'password123',
        });
    });

    it('should get all users', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(true);
          expect(res.body.message).toBe('Users fetched successfully');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
          res.body.data.forEach((user: any) => {
            expect(user).not.toHaveProperty('password');
          });
        });
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/users')
        .expect(401);
    });
  });

  describe('GET /users/:id', () => {
    let userId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Get User',
          email: `getuser${Date.now()}@example.com`,
          password: 'password123',
        });
      expect(response.status).toBe(201);
      expect(response.body.data).toBeDefined();
      userId = response.body.data.id;
    });

    it('should get user by id', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(true);
          expect(res.body.message).toBe('User fetched successfully');
          expect(res.body.data.id).toBe(userId);
          expect(res.body.data).not.toHaveProperty('password');
        });
    });

    it('should return 404 for non-existent user', () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .get(`/users/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.status).toBe(false);
          expect(res.body.message).toBe('User not found');
        });
    });

    it('should return 400 for invalid uuid', () => {
      return request(app.getHttpServer())
        .get('/users/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('PATCH /users/:id', () => {
    let userId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Update User',
          email: `updateuser${Date.now()}@example.com`,
          password: 'password123',
        });
      expect(response.status).toBe(201);
      expect(response.body.data).toBeDefined();
      userId = response.body.data.id;
    });

    it('should update user successfully', () => {
      return request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(true);
          expect(res.body.message).toBe('User updated successfully');
          expect(res.body.data.name).toBe('Updated Name');
          expect(res.body.data.id).toBe(userId);
        });
    });

    it('should update email successfully', async () => {
      return request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: `newemail${Date.now()}@example.com`,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(true);
          expect(res.body.data.email).toBeDefined();
        });
    });

    it('should return error when updating to duplicate email', async () => {
      const otherEmail = `other${Date.now()}@example.com`;
      await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Other User',
          email: otherEmail,
          password: 'password123',
        });

      return request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: otherEmail,
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.status).toBe(false);
          expect(res.body.message).toBe('Email already in use');
        });
    });

    it('should return 404 for non-existent user', () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .patch(`/users/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated',
        })
        .expect(404)
        .expect((res) => {
          expect(res.body.status).toBe(false);
          expect(res.body.message).toBe('User not found');
        });
    });
  });

  describe('DELETE /users/:id', () => {
    let userId: string;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Delete User',
          email: `deleteuser${Date.now()}@example.com`,
          password: 'password123',
        });
      expect(response.status).toBe(201);
      expect(response.body.data).toBeDefined();
      userId = response.body.data.id;
    });

    it('should delete user successfully', () => {
      return request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(true);
          expect(res.body.message).toBe('User deleted successfully');
          expect(res.body.data.deleted).toBe(true);
        });
    });

    it('should return 404 when deleting non-existent user', () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .delete(`/users/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.status).toBe(false);
          expect(res.body.message).toBe('User not found');
        });
    });
  });
});

