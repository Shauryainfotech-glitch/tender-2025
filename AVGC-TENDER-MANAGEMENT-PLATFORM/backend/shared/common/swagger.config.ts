// config/swagger.config.ts
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication, configService: ConfigService): void {
  const config = new DocumentBuilder()
    .setTitle('Tender Management API')
    .setDescription('API documentation for Tender Management System')
    .setVersion(configService.get<string>('app.version', '1.0'))
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Tenders', 'Tender management endpoints')
    .addTag('Bids', 'Bid management endpoints')
    .addTag('Documents', 'Document management endpoints')
    .addTag('EMD', 'EMD (Earnest Money Deposit) endpoints')
    .addTag('Security', 'Security related endpoints')
    .addTag('Pricing', 'Pricing management endpoints')
    .addTag('Notifications', 'Notification endpoints')
    .addTag('Reports', 'Reporting endpoints')
    .addTag('Analytics', 'Analytics endpoints')
    .addServer(configService.get<string>('app.apiUrl', 'http://localhost:3000'), 'Development server')
    .addServer('https://api.tendermanagement.com', 'Production server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: {
        active: true,
        theme: 'obsidian',
      },
      tryItOutEnabled: true,
    },
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Tender Management API Docs',
    customfavIcon: '/favicon.ico',
  });
}
