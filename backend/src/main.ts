import * as dotenv from 'dotenv';
import { join } from 'path';

// This MUST be the first line in the file
dotenv.config({ path: join(process.cwd(), '.env') });

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { PaginationInterceptor } from './common/pagination.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Enable Global Validation
  // This ensures the CreateOrderDto rules (like MaxLength 25) are enforced
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips away fields that aren't in the DTO
      forbidNonWhitelisted: true, // Throws an error if extra fields are sent
      transform: true, // Automatically transforms payloads to match DTO types
    }),
  );

  // 1.5 Enable Global Pagination Interceptor
  app.useGlobalInterceptors(new PaginationInterceptor());

  // 2. Configure CORS
  // Allowing both the Admin Panel (5173) and the upcoming Customer Site (3000)
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    exposedHeaders: ['X-Total-Count'],
  });

  // 3. Start the Server
  await app.listen(3001);
  console.log(`🚀 API Service is running on: http://localhost:3001`);
}
bootstrap();