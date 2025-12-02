// ---------------------------------------------------------------------
// <copyright file="users.service.spec.ts" company="Code Inbound LLP">
// Copyright (c) Code Inbound LLP. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './user.entity';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let repo: {
    find: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
    create: jest.Mock;
  };

  beforeEach(async () => {
    repo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: repo,
        },
      ],
    }).compile();

    service = moduleRef.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // create user test
  it('creates a user with hashed password', async () => {
    repo.findOne.mockResolvedValue(null);
    repo.create.mockImplementation((val) => val);
    repo.save.mockResolvedValue({
      id: '1',
      name: 'Pradhyum',
      email: 'png@gmail.com',
      password: 'hashed',
      createdAt: new Date(),
    });
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

    const result = await service.create({
      name: 'Pradhyum',
      email: 'png@gmail.com',
      password: 'pradhyum@123',
    });

    expect(bcrypt.hash).toHaveBeenCalled();
    expect(result.password).toBeUndefined();
  });

  // get all users test
  it('returns all users without password', async () => {
    repo.find.mockResolvedValue([
      {
        id: '1',
        name: 'Pradhyum',
        email: 'png@gmail.com',
        password: 'hash',
        createdAt: new Date(),
      },
    ]);

    const users = await service.findAll();
    expect(users).toHaveLength(1);
    expect(users[0].password).toBeUndefined();
  });

  // duplicate email error test
  it('throws error when email already exists on create', async () => {
    repo.findOne.mockResolvedValue({ id: '1', email: 'png@gmail.com' });
    
    await expect(
      service.create({
        name: 'Pradhyum',
        email: 'png@gmail.com',
        password: 'pradhyum@123',
      }),
    ).rejects.toThrow('Email already in use');
  });

  // user not found error test
  it('throws error when user not found on findOne', async () => {
    repo.findOne.mockResolvedValue(null);
    
    await expect(service.findOne('999')).rejects.toThrow('User not found');
  });

  // update user test
  it('updates user name', async () => {
    const user: User = {
      id: '1',
      name: 'Pradhyum',
      email: 'png@gmail.com',
      password: 'hash',
      createdAt: new Date(),
    };
    repo.findOne.mockResolvedValue(user);
    repo.save.mockImplementation((val) => val);

    const result = await service.update('1', { name: 'Pradhyum Updated' });
    expect(result.name).toEqual('Pradhyum Updated');
    expect(result.password).toBeUndefined();
  });

  // duplicate email on update error test
  it('throws error when updating with duplicate email', async () => {
    const user: User = {
      id: '1',
      name: 'Pradhyum',
      email: 'png@gmail.com',
      password: 'hash',
      createdAt: new Date(),
    };
    const existingUser: User = {
      id: '2',
      name: 'Other User',
      email: 'other@gmail.com',
      password: 'hash',
      createdAt: new Date(),
    };
    repo.findOne
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(existingUser);

    await expect(
      service.update('1', { email: 'other@gmail.com' }),
    ).rejects.toThrow('Email already in use');
  });

  // delete user test
  it('deletes user successfully', async () => {
    const user: User = {
      id: '1',
      name: 'Pradhyum',
      email: 'png@gmail.com',
      password: 'hash',
      createdAt: new Date(),
    };
    repo.findOne.mockResolvedValue(user);
    repo.delete.mockResolvedValue({ affected: 1 });

    const result = await service.remove('1');
    expect(result.deleted).toBe(true);
  });
});

