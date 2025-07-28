import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3000);
  
  // Security middleware
  app.use(helmet());
  app.use(compression());
  
  // CORS configuration
  const corsConfig = configService.get('cors');
  app.enableCors(corsConfig);
  
  // Global prefix
  app.setGlobalPrefix('api/v1');
  
  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Tender Management API')
    .setDescription('API documentation for Tender Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('tenders', 'Tender management endpoints')
    .addTag('bids', 'Bid management endpoints')
    .addTag('organizations', 'Organization management endpoints')
    .addTag('contracts', 'Contract management endpoints')
    .addTag('vendors', 'Vendor management endpoints')
    .addTag('payments', 'Payment processing endpoints')
    .addTag('security', 'Security module endpoints')
    .addTag('analytics', 'Analytics and reporting endpoints')
    .addTag('notifications', 'Notification endpoints')
    .addTag('files', 'File management endpoints')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  // Database connection info
  logger.log(`Connecting to Neon PostgreSQL database...`);
  logger.log(`Database Host: ${configService.get('database.host')}`);
  logger.log(`Database Name: ${configService.get('database.database')}`);
  
  await app.listen(port);
  
  logger.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
  logger.log(`📚 API Documentation available at: http://localhost:${port}/api/docs`);
  logger.log(`🔒 Connected to Neon PostgreSQL successfully!`);
}
