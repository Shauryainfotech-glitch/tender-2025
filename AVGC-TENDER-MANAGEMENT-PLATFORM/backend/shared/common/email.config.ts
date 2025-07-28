// config/email.config.ts
import { registerAs } from '@nestjs/config';

export const emailConfig = registerAs('email', () => ({
  transport: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-password',
    },
  },
  defaults: {
    from: process.env.EMAIL_FROM || '"Tender Management" <noreply@tendermanagement.com>',
  },
  preview: process.env.EMAIL_PREVIEW === 'true',
  
  // Templates
  templatesDir: process.env.EMAIL_TEMPLATES_DIR || './src/templates/emails',
  
  // Rate Limiting
  rateLimit: {
    max: parseInt(process.env.EMAIL_RATE_LIMIT_MAX, 10) || 10,
    duration: parseInt(process.env.EMAIL_RATE_LIMIT_DURATION, 10) || 3600000, // 1 hour
  },
  
  // Queue Settings
  queue: {
    name: 'email-queue',
    concurrency: parseInt(process.env.EMAIL_QUEUE_CONCURRENCY, 10) || 5,
  },
}));
