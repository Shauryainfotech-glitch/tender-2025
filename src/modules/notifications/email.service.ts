// modules/notifications/email.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { NotificationType } from './entities/notification.entity';

@Injectable()
export class EmailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Tender Management System',
      template: './welcome',
      context: {
        name,
        appName: this.configService.get('app.name'),
        appUrl: this.configService.get('app.url'),
      },
    });
  }

  async sendPasswordResetEmail(
    email: string,
    name: string,
    resetToken: string,
  ): Promise<void> {
    const resetUrl = `${this.configService.get('app.url')}/reset-password?token=${resetToken}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset Request',
      template: './password-reset',
      context: {
        name,
        resetUrl,
        appName: this.configService.get('app.name'),
      },
    });
  }

  async sendEmailVerification(
    email: string,
    name: string,
    verificationToken: string,
  ): Promise<void> {
    const verificationUrl = `${this.configService.get('app.url')}/verify-email?token=${verificationToken}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Verify Your Email',
      template: './email-verification',
      context: {
        name,
        verificationUrl,
        appName: this.configService.get('app.name'),
      },
    });
  }

  async sendNotificationEmail(
    email: string,
    title: string,
    message: string,
    type: NotificationType,
    metadata?: any,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: title,
      template: './notification',
      context: {
        title,
        message,
        type,
        metadata,
        appName: this.configService.get('app.name'),
        appUrl: this.configService.get('app.url'),
      },
    });
  }

  async sendTenderInvitation(
    email: string,
    organizationName: string,
    tenderTitle: string,
    tenderUrl: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: `Invitation to Bid: ${tenderTitle}`,
      template: './tender-invitation',
      context: {
        organizationName,
        tenderTitle,
        tenderUrl,
        appName: this.configService.get('app.name'),
      },
    });
  }

  async sendBidConfirmation(
    email: string,
    supplierName: string,
    tenderTitle: string,
    bidAmount: number,
    bidReference: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Bid Submission Confirmation',
      template: './bid-confirmation',
      context: {
        supplierName,
        tenderTitle,
        bidAmount,
        bidReference,
        appName: this.configService.get('app.name'),
      },
    });
  }

  async sendBidResult(
    email: string,
    supplierName: string,
    tenderTitle: string,
    isWinner: boolean,
    message?: string,
  ): Promise<void> {
    const subject = isWinner
      ? 'Congratulations! Your Bid Has Been Selected'
      : 'Bid Result Notification';

    await this.mailerService.sendMail({
      to: email,
      subject,
      template: './bid-result',
      context: {
        supplierName,
        tenderTitle,
        isWinner,
        message,
        appName: this.configService.get('app.name'),
      },
    });
  }

  async sendOrganizationVerified(
    email: string,
    organizationName: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Organization Verified',
      template: './organization-verified',
      context: {
        organizationName,
        appName: this.configService.get('app.name'),
        appUrl: this.configService.get('app.url'),
      },
    });
  }

  async sendWeeklyDigest(
    email: string,
    name: string,
    stats: {
      newTenders: number;
      activeBids: number;
      wonBids: number;
      upcomingDeadlines: any[];
    },
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Your Weekly Tender Management Digest',
      template: './weekly-digest',
      context: {
        name,
        stats,
        appName: this.configService.get('app.name'),
        appUrl: this.configService.get('app.url'),
      },
    });
  }
}
