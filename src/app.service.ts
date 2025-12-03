// ---------------------------------------------------------------------
// <copyright file="app.service.ts" company="Code Inbound LLP">
// Copyright (c) Code Inbound LLP. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

import { Injectable } from '@nestjs/common';

// AppService is main service for the app
@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to Code Inbound LLP Services page by Pradhyum Garashya';
  }
}
