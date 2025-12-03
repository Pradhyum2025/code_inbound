// ---------------------------------------------------------------------
// <copyright file="users.service.ts" company="Code Inbound LLP">
// Copyright (c) Code Inbound LLP. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // create user
  async create(createUserDto: CreateUserDto) {
    const sameEmail = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (sameEmail) {
      throw new BadRequestException({
        status: false,
        message: 'Email already in use',
      });
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const saved = await this.usersRepository.save(user);

    // remove password before return
    return this.removePassword(saved);
  }

  // get all users
  async findAll() {
    const users = await this.usersRepository.find();
    console.log("Getting reqest at find all user")
    return users.map((user) => this.removePassword(user));
  }

  // get user by id
  async findOne(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException({
        status: false,
        message: 'User not found',
      });
    }
    return this.removePassword(user);
  }

 
  // Helper method
  private async findEntity(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException({
        status: false,
        message: 'User not found',
      });
    }
    return user;
  }

  // update user
  async update(id: string, updateUserDto: UpdateUserDto) {

    const user = await this.findEntity(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingEmail = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingEmail) {
        throw new BadRequestException({
          status: false,
          message: 'Email already in use',
        });
      }
      user.email = updateUserDto.email;
    }

    if (updateUserDto.name) {
      user.name = updateUserDto.name;
    }

    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const saved = await this.usersRepository.save(user);
    
    return this.removePassword(saved);
  }

  // delete user
  async remove(id: string) {
    const user = await this.findEntity(id);
    await this.usersRepository.delete(user.id);
    return { deleted: true };
  }
  
  //find user by email
  async findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email } });
  }

  //Helper function remove password from object
  private removePassword(user: User) {
    if (!user) {
      return null;
    }
    const { password, ...rest } = user;

    return rest;
  }
}

