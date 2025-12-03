// ---------------------------------------------------------------------
// <copyright file="jwt-auth.guard.ts" company="Code Inbound LLP">
// Copyright (c) Code Inbound LLP. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // const req = context.switchToHttp().getRequest();
    // const authHeader = req.headers?.authorization || req.headers?.Authorization;
   
    return super.canActivate(context);
  }

  // handleRequest is called after canActivate
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err) {
      console.log('JWT validation failed:', {
        err: err?.message,
        info
      });

      throw err || new UnauthorizedException('Invalid token');
    }

    return user;
  }
}

