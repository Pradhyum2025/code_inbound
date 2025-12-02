// ---------------------------------------------------------------------
// <copyright file="  " company="Code Inbound LLP">
// Copyright (c) Code Inbound LLP. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    controller = new UsersController(service);
  });

  // create user test
  it('creates a user', async () => {
    const mockUser = { id: '1', name: 'Pradhyum', email: 'png@gmail.com', createdAt: new Date() };
    service.create.mockResolvedValue(mockUser);
    const result = await controller.create({
      name: 'Pradhyum',
      email: 'png@gmail.com',
      password: 'pradhyum@123',
    });
    expect(service.create).toHaveBeenCalled();
    expect(result.status).toBe(true);
    expect(result.data?.id).toEqual('1');
  });

  // get all users test
  it('gets all users', async () => {
    const mockUsers = [{ id: '1', name: 'Pradhyum', email: 'png@gmail.com', createdAt: new Date() }];
    service.findAll.mockResolvedValue(mockUsers);
    const result = await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
    expect(result.status).toBe(true);
    expect(result.data).toHaveLength(1);
  });

  // get user by id test
  it('gets user by id', async () => {
    const mockUser = { id: '1', name: 'Pradhyum', email: 'png@gmail.com', createdAt: new Date() };
    service.findOne.mockResolvedValue(mockUser);
    const result = await controller.findOne('1');
    expect(service.findOne).toHaveBeenCalledWith('1');
    expect(result.status).toBe(true);
    expect(result.data?.id).toBe('1');
  });

  // update user test
  it('updates a user', async () => {
    const mockUser = { id: '1', name: 'Pradhyum Updated', email: 'png@gmail.com', createdAt: new Date() };
    service.update.mockResolvedValue(mockUser);
    const result = await controller.update('1', { name: 'Pradhyum Updated' });
    expect(service.update).toHaveBeenCalledWith('1', { name: 'Pradhyum Updated' });
    expect(result.status).toBe(true);
    expect(result.data?.name).toBe('Pradhyum Updated');
  });

  // delete user test
  it('deletes a user', async () => {
    service.remove.mockResolvedValue({ deleted: true });
    const result = await controller.remove('1');
    expect(service.remove).toHaveBeenCalledWith('1');
    expect(result.status).toBe(true);
    expect(result.data.deleted).toBe(true);
  });
});

