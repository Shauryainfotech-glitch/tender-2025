// config/email.config.ts
import { registerAs } from '@nestjs/config';

export const emailConfig = registerAs('email', () => ({
  // SMTP Configuration
  transport: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your-app-password',
    },
    tls: {
      rejectUnauthorized: process.env.EMAIL_TLS_REJECT_UNAUTHORIZED !== 'false',
    },
  },
  
  // Default Email Settings
  defaults: {
    from: process.env.EMAIL_FROM || '"Tender Management System" <noreply@tenderplatform.com>',
    replyTo: process.env.EMAIL_REPLY_TO || 'support@tenderplatform.com',
  },
  
  // Template Configuration
  template: {
    dir: process.env.EMAIL_TEMPLATE_DIR || './src/templates/email',
    adapter: 'handlebars',
    options: {
      strict: true,
    },
  },
  
  // Email Queue Configuration
  queue: {
    enabled: process.env.EMAIL_QUEUE_ENABLED === 'true',
    name: process.env.EMAIL_QUEUE_NAME || 'email-queue',
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    },
    defaultJobOptions: {
      removeOnComplete: parseInt(process.env.EMAIL_QUEUE_REMOVE_ON_COMPLETE, 10) || 10,
      removeOnFail: parseInt(process.env.EMAIL_QUEUE_REMOVE_ON_FAIL, 10) || 5,
      attempts: parseInt(process.env.EMAIL_QUEUE_ATTEMPTS, 10) || 3,
      backoff: {
        type: 'exponential',
        delay: parseInt(process.env.EMAIL_QUEUE_BACKOFF_DELAY, 10) || 2000,
      },
    },
  },
  
  // Rate Limiting
  rateLimit: {
    enabled: process.env.EMAIL_RATE_LIMIT_ENABLED === 'true',
    max: parseInt(process.env.EMAIL_RATE_LIMIT_MAX, 10) || 10, // emails per window
    windowMs: parseInt(process.env.EMAIL_RATE_LIMIT_WINDOW, 10) || 60000, // 1 minute
  },
  
  // Email Types Configuration
  types: {
    welcome: {
      subject: 'Welcome to Tender Management System',
      template: 'welcome',
    },
    passwordReset: {
      subject: 'Password Reset Request',
      template: 'password-reset',
    },
    tenderNotification: {
      subject: 'New Tender Notification',
      template: 'tender-notification',
    },
    bidSubmission: {
      subject: 'Bid Submission Confirmation',
      template: 'bid-submission',
    },
    tenderAward: {
      subject: 'Tender Award Notification',
      template: 'tender-award',
    },
    accountVerification: {
      subject: 'Account Verification Required',
      template: 'account-verification',
    },
  },
  
  // Development/Testing Configuration
  preview: process.env.EMAIL_PREVIEW === 'true',
  testMode: process.env.NODE_ENV === 'test',
  logEmails: process.env.EMAIL_LOG_ENABLED === 'true',
  
  // Security Configuration
  encryption: {
    enabled: process.env.EMAIL_ENCRYPTION_ENABLED === 'true',
    key: process.env.EMAIL_ENCRYPTION_KEY || 'your-encryption-key',
  },
  
  // Bounce Handling
  bounceHandling: {
    enabled: process.env.EMAIL_BOUNCE_HANDLING_ENABLED === 'true',
    webhookUrl: process.env.EMAIL_BOUNCE_WEBHOOK_URL,
    maxBounces: parseInt(process.env.EMAIL_MAX_BOUNCES, 10) || 3,
  },
}));

export default emailConfig;
