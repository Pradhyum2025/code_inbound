// ---------------------------------------------------------------------
// <copyright file="auth.service.ts" company="Code Inbound LLP">
// Copyright (c) Code Inbound LLP. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // register user
  register(registerDto: RegisterDto) {
    return this.usersService.create(registerDto);
  }

  // login user
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException({
        status: false,
        message: 'Invalid credentials',
      });
    }

    const payload = { sub: user.id, email: user.email };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  // validate user credentials
  async validateUser(email: string, password: string) {
    
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return null;
    }

    // compare raw password to the hashed one in the database
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return null;
    }
    return user;
  }
}

