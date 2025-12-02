// ---------------------------------------------------------------------
// <copyright file="auth.controller.spec.ts" company="Code Inbound LLP">
// Copyright (c) Code Inbound LLP. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(() => {
    service = {
      register: jest.fn(),
      login: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    controller = new AuthController(service);
  });

  // register user test
  it('should register a user', async () => {
    const userData = { id: '1', name: 'Pradhyum', email: 'png@gmail.com' };
    service.register.mockResolvedValue(userData);

    const result = await controller.register({
      name: 'Pradhyum',
      email: 'png@gmail.com',
      password: 'pradhyum@123',
    });

    expect(service.register).toHaveBeenCalled();
    expect(result.status).toBe(true);
    expect(result.message).toBe('User registered successfully');
    expect(result.data).toEqual(userData);
  });

  // login user test
  it('should login and return token', async () => {
    service.login.mockResolvedValue({ accessToken: 'pradhyum_test_token' });

    const result = await controller.login({
      email: 'png@gmail.com',
      password: 'pradhyum@123',
    });

    expect(service.login).toHaveBeenCalled();
    expect(result.status).toBe(true);
    expect(result.message).toBe('Login successful');
    expect(result.token).toBe('pradhyum_test_token');
  });
});

