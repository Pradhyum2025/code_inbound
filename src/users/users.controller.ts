// ---------------------------------------------------------------------
// <copyright file="users.controller.ts" company="Code Inbound LLP">
// Copyright (c) Code Inbound LLP. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // create user
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);

    return {
      status: true,
      message: 'User created successfully',
      data: user,
    };
  }

  // get all users
  @Get()
  async findAll() {
    const users = await this.usersService.findAll();

    return {
      status: true,
      message: 'Users fetched successfully',
      data: users,
    };
  }

  // get user by id
  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const user = await this.usersService.findOne(id);

    return {
      status: true,
      message: 'User fetched successfully',
      data: user,
    };
  }

  // update user
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, updateUserDto);

    return {
      status: true,
      message: 'User updated successfully',
      data: user,
    };
  }

  // delete user
  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    const result = await this.usersService.remove(id);

    return {
      status: true,
      message: 'User deleted successfully',
      data: result,
    };
    
  }
}

