import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  template?: string;
  html?: string;
  text?: string;
  context?: Record<string, any>;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content?: Buffer | string;
    path?: string;
    contentType?: string;
  }>;
  priority?: 'high' | 'normal' | 'low';
  replyTo?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;
  private templatesCache: Map<string, handlebars.TemplateDelegate> = new Map();

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
    this.loadTemplates();
  }

  private initializeTransporter() {
    const emailConfig = {
      host: this.configService.get<string>('EMAIL_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('EMAIL_PORT', 587),
      secure: this.configService.get<boolean>('EMAIL_SECURE', false),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    };

    this.transporter = nodemailer.createTransport(emailConfig);

    // Verify transporter configuration
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('Email transporter verification failed:', error);
      } else {
        this.logger.log('Email transporter is ready');
      }
    });
  }

  private async loadTemplates() {
    try {
      const templatesDir = path.join(process.cwd(), 'src', 'templates', 'email');
      const templateFiles = await fs.readdir(templatesDir);

      for (const file of templateFiles) {
        if (file.endsWith('.hbs')) {
          const templateName = file.replace('.hbs', '');
          const templatePath = path.join(templatesDir, file);
          const templateContent = await fs.readFile(templatePath, 'utf-8');
          const compiledTemplate = handlebars.compile(templateContent);
          this.templatesCache.set(templateName, compiledTemplate);
        }
      }

      // Register common helpers
      handlebars.registerHelper('formatDate', (date: Date) => {
        return new Date(date).toLocaleDateString();
      });

      handlebars.registerHelper('formatCurrency', (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
        }).format(amount);
      });

      handlebars.registerHelper('ifEquals', function(arg1: any, arg2: any, options: any) {
        return arg1 === arg2 ? options.fn(this) : options.inverse(this);
      });

      this.logger.log(`Loaded ${this.templatesCache.size} email templates`);
    } catch (error) {
      this.logger.error('Failed to load email templates:', error);
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      let html = options.html;
      let text = options.text;

      // Use template if provided
      if (options.template && this.templatesCache.has(options.template)) {
        const template = this.templatesCache.get(options.template);
        const defaultContext = {
          appName: this.configService.get<string>('APP_NAME', 'Tender Management System'),
          appUrl: this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000'),
          year: new Date().getFullYear(),
          ...options.context,
        };
        html = template(defaultContext);
      }

      // Ensure we have content to send
      if (!html && !text) {
        throw new Error('No email content provided');
      }

      const mailOptions = {
        from: this.configService.get<string>('EMAIL_FROM', 'noreply@tendermanagement.com'),
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html,
        text,
        cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
        bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
        attachments: options.attachments,
        priority: options.priority,
        replyTo: options.replyTo,
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      this.logger.log(`Email sent successfully to ${options.to}`, {
        messageId: result.messageId,
        subject: options.subject,
      });

      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      return false;
    }
  }

  async sendBulkEmails(recipients: EmailOptions[]): Promise<{
    sent: number;
    failed: number;
    results: Array<{ email: string; success: boolean; error?: string }>;
  }> {
    const results = [];
    let sent = 0;
    let failed = 0;

    for (const emailOptions of recipients) {
      try {
        const success = await this.sendEmail(emailOptions);
        if (success) {
          sent++;
          results.push({ email: emailOptions.to as string, success: true });
        } else {
          failed++;
          results.push({ email: emailOptions.to as string, success: false });
        }
      } catch (error) {
        failed++;
        results.push({
          email: emailOptions.to as string,
          success: false,
          error: error.message,
        });
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { sent, failed, results };
  }

  async sendPasswordResetEmail(email: string, resetToken: string, userName: string) {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/auth/reset-password?token=${resetToken}`;
    
    return this.sendEmail({
      to: email,
      subject: 'Password Reset Request',
      template: 'password-reset',
      context: {
        userName,
        resetUrl,
        expiryHours: 24,
      },
    });
  }

  async sendEmailVerificationEmail(email: string, verificationToken: string, userName: string) {
    const verificationUrl = `${this.configService.get<string>('FRONTEND_URL')}/auth/verify-email?token=${verificationToken}`;
    
    return this.sendEmail({
      to: email,
      subject: 'Email Verification',
      template: 'email-verification',
      context: {
        userName,
        verificationUrl,
      },
    });
  }

  async sendWelcomeEmail(email: string, userName: string, role: string) {
    return this.sendEmail({
      to: email,
      subject: 'Welcome to Tender Management System',
      template: 'welcome',
      context: {
        userName,
        role,
        loginUrl: `${this.configService.get<string>('FRONTEND_URL')}/login`,
      },
    });
  }

  async sendTenderNotificationEmail(email: string, data: {
    userName: string;
    tenderTitle: string;
    tenderNumber: string;
    action: string;
    deadline?: Date;
    tenderUrl: string;
  }) {
    return this.sendEmail({
      to: email,
      subject: `Tender ${data.action}: ${data.tenderTitle}`,
      template: 'tender-notification',
      context: data,
    });
  }

  async sendBidNotificationEmail(email: string, data: {
    userName: string;
    tenderTitle: string;
    bidderName: string;
    action: string;
    bidAmount?: number;
    bidUrl: string;
  }) {
    return this.sendEmail({
      to: email,
      subject: `Bid ${data.action}: ${data.tenderTitle}`,
      template: 'bid-notification',
      context: data,
    });
  }

  async sendContractNotificationEmail(email: string, data: {
    userName: string;
    contractNumber: string;
    contractTitle: string;
    action: string;
    contractUrl: string;
  }) {
    return this.sendEmail({
      to: email,
      subject: `Contract ${data.action}: ${data.contractTitle}`,
      template: 'contract-notification',
      context: data,
    });
  }

  async sendPaymentNotificationEmail(email: string, data: {
    userName: string;
    paymentType: string;
    amount: number;
    status: string;
    referenceNumber: string;
    paymentUrl: string;
  }) {
    return this.sendEmail({
      to: email,
      subject: `Payment ${data.status}: ${data.paymentType}`,
      template: 'payment-notification',
      context: data,
    });
  }

  async testEmailConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      this.logger.error('Email connection test failed:', error);
      return false;
    }
  }
}