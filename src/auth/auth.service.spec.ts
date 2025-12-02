// ---------------------------------------------------------------------
// <copyright file="auth.service.spec.ts" company="Code Inbound LLP">
// Copyright (c) Code Inbound LLP. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    jwtService = {
      sign: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  // register user test
  it('should register user by calling users service', async () => {
    const userData = { id: '1', name: 'Pradhyum', email: 'png@gmail.com' };
    usersService.create.mockResolvedValue(userData);

    const result = await service.register({
      name: 'Pradhyum',
      email: 'png@gmail.com',
      password: 'pradhyum@123',
    });

    expect(usersService.create).toHaveBeenCalled();
    expect(result).toEqual(userData);
  });


  // login user test
  it('should login successfully with valid credentials', async () => {
    const user = {
      id: '1',
      email: 'png@gmail.com',
      password: 'hashed-password',
    };
    usersService.findByEmail.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jwtService.sign.mockReturnValue('pradhyum_test_token');

    const result = await service.login({
      email: 'png@gmail.com',
      password: 'pradhyum@123',
    });

    expect(bcrypt.compare).toHaveBeenCalled();
    expect(jwtService.sign).toHaveBeenCalled();
    expect(result.accessToken).toBe('pradhyum_test_token');
  });


  // invalid password error test
  it('should throw error for invalid password', async () => {
    const user = {
      id: '1',
      email: 'png@gmail.com',
      password: 'hashed-password',
    };
    usersService.findByEmail.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login({
        email: 'png@gmail.com',
        password: 'wrongpassword',
      }),
    ).rejects.toThrow('Invalid credentials');
  });

  // user not found error test
  it('should throw error for non-existent user', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'nonexistentpng@gmail.com',
        password: 'pradhyum@123',
      }),
    ).rejects.toThrow('Invalid credentials');
  });
});

