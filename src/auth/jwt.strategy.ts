  // ---------------------------------------------------------------------
  // <copyright file="jwt.strategy.ts" company="Code Inbound LLP">
  // Copyright (c) Code Inbound LLP. All rights reserved.
  // </copyright>
  // ---------------------------------------------------------------------

import { Injectable } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { PassportStrategy } from '@nestjs/passport';
  import { ExtractJwt, Strategy } from 'passport-jwt';

  @Injectable()
  export class JwtStrategy extends PassportStrategy(Strategy) {
    
    constructor(private configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET') || 'secret';
    console.log('JwtStrategy using secret:', jwtSecret);
    super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: jwtSecret,
      });
    }

    async validate(payload: { sub: string; email: string }) {

      console.log('JwtStrategy validate payload:', payload);
      
      return { userId: payload.sub, email: payload.email };
    }
  }

