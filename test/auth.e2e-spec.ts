// ---------------------------------------------------------------------
// <copyright file="auth.e2e-spec.ts" company="Code Inbound LLP">
// Copyright (c) Code Inbound LLP. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', () => {
      const uniqueEmail = `test${Date.now()}@example.com`;
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: uniqueEmail,
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.status).toBe(true);
          expect(res.body.message).toBe('User registered successfully');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data).toHaveProperty('name', 'Test User');
          expect(res.body.data).toHaveProperty('email', uniqueEmail);
          expect(res.body.data).not.toHaveProperty('password');
        });
    });

    it('should return error when email already exists', async () => {
      const duplicateEmail = `duplicate${Date.now()}@example.com`;
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'First User',
          email: duplicateEmail,
          password: 'password123',
        });

      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Second User',
          email: duplicateEmail,
          password: 'password123',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.status).toBe(false);
          expect(res.body.message).toBe('Email already in use');
        });
    });

    it('should return validation error for invalid data', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: '',
          email: 'invalid-email',
          password: '123',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBeDefined();
        });
    });
  });

  describe('POST /auth/login', () => {
    let loginEmail: string;

    beforeEach(async () => {
      loginEmail = `login${Date.now()}@example.com`;
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Login Test User',
          email: loginEmail,
          password: 'password123',
        });
    });

    it('should login successfully and return token', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: loginEmail,
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.status).toBe(true);
          expect(res.body.message).toBe('Login successful');
          expect(res.body.token).toBeDefined();
          expect(typeof res.body.token).toBe('string');
        });
    });

    it('should return error for invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: loginEmail,
          password: 'wrongpassword',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.status).toBe(false);
          expect(res.body.message).toBe('Invalid credentials');
        });
    });

    it('should return error for non-existent user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: `nonexistent${Date.now()}@example.com`,
          password: 'password123',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.status).toBe(false);
          expect(res.body.message).toBe('Invalid credentials');
        });
    });
  });
});

