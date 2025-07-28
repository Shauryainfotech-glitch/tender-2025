// config/app.config.ts
import { registerAs } from '@nestjs/config';

const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  apiPrefix: process.env.API_PREFIX || 'api',
  version: process.env.APP_VERSION || '1.0.0',
  name: process.env.APP_NAME || 'Tender Management System',
  
  // Security
  corsOrigins: process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:4200',
  
  // Rate Limiting
  rateLimitTTL: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  
  // File Upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10485760, // 10MB
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  
  // Email
  emailFrom: process.env.EMAIL_FROM || 'noreply@tenderplatform.com',
  
  // Frontend URL
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
  
  // API Keys
  encryptionKey: process.env.ENCRYPTION_KEY || 'your-encryption-key',
  
  // Features
  enableSwagger: process.env.ENABLE_SWAGGER === 'true',
  enableMetrics: process.env.ENABLE_METRICS === 'true',
  enableLogging: process.env.ENABLE_LOGGING !== 'false',
}));

export default appConfig;
