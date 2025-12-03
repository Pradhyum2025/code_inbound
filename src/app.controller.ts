// ---------------------------------------------------------------------
// <copyright file="app.controller.ts" company="Code Inbound LLP">
// Copyright (c) Code Inbound LLP. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Get the welcome message
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
