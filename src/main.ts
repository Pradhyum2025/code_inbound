// ---------------------------------------------------------------------
// <copyright file="main.ts" company="Code Inbound LLP">
// Copyright (c) Code Inbound LLP. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  
  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );
  
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Server is running on port ${process.env.PORT}`);
}

bootstrap();
