import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';

export interface SmsOptions {
  to: string | string[];
  message: string;
  mediaUrl?: string[];
}

export interface SmsResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  to?: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private twilioClient: twilio.Twilio;
  private fromNumber: string;
  private isEnabled: boolean;

  constructor(private configService: ConfigService) {
    this.initializeTwilio();
  }

  private initializeTwilio() {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromNumber = this.configService.get<string>('TWILIO_FROM_NUMBER');
    this.isEnabled = this.configService.get<boolean>('SMS_ENABLED', false);

    if (this.isEnabled && accountSid && authToken && this.fromNumber) {
      try {
        this.twilioClient = twilio(accountSid, authToken);
        this.logger.log('Twilio SMS service initialized successfully');
      } catch (error) {
        this.logger.error('Failed to initialize Twilio client:', error);
        this.isEnabled = false;
      }
    } else {
      this.logger.warn('SMS service is disabled or missing configuration');
      this.isEnabled = false;
    }
  }

  async sendSms(options: SmsOptions): Promise<SmsResponse> {
    if (!this.isEnabled) {
      this.logger.warn('SMS service is disabled');
      return {
        success: false,
        error: 'SMS service is disabled',
      };
    }

    try {
      const recipients = Array.isArray(options.to) ? options.to : [options.to];
      const results: SmsResponse[] = [];

      for (const recipient of recipients) {
        try {
          const formattedNumber = this.formatPhoneNumber(recipient);
          
          const message = await this.twilioClient.messages.create({
            body: options.message,
            from: this.fromNumber,
            to: formattedNumber,
            ...(options.mediaUrl && { mediaUrl: options.mediaUrl }),
          });

          this.logger.log(`SMS sent successfully to ${formattedNumber}`, {
            messageId: message.sid,
          });

          results.push({
            success: true,
            messageId: message.sid,
            to: formattedNumber,
          });
        } catch (error) {
          this.logger.error(`Failed to send SMS to ${recipient}:`, error);
          results.push({
            success: false,
            error: error.message,
            to: recipient,
          });
        }
      }

      // Return single result for single recipient
      if (recipients.length === 1) {
        return results[0];
      }

      // Return aggregated result for multiple recipients
      const successCount = results.filter(r => r.success).length;
      return {
        success: successCount > 0,
        error: successCount === 0 ? 'All SMS messages failed' : undefined,
      };
    } catch (error) {
      this.logger.error('Failed to send SMS:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendBulkSms(messages: SmsOptions[]): Promise<{
    sent: number;
    failed: number;
    results: SmsResponse[];
  }> {
    const results: SmsResponse[] = [];
    let sent = 0;
    let failed = 0;

    for (const message of messages) {
      const result = await this.sendSms(message);
      results.push(result);
      
      if (result.success) {
        sent++;
      } else {
        failed++;
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { sent, failed, results };
  }

  async sendOtp(phoneNumber: string, otp: string): Promise<SmsResponse> {
    const message = `Your OTP for Tender Management System is: ${otp}. This code will expire in 10 minutes.`;
    return this.sendSms({ to: phoneNumber, message });
  }

  async sendTenderNotification(phoneNumber: string, data: {
    tenderTitle: string;
    action: string;
    deadline?: Date;
  }): Promise<SmsResponse> {
    let message = `Tender ${data.action}: ${data.tenderTitle}`;
    
    if (data.deadline) {
      const deadline = new Date(data.deadline).toLocaleDateString();
      message += ` - Deadline: ${deadline}`;
    }

    message += '. Check your email for details.';
    
    return this.sendSms({ to: phoneNumber, message });
  }

  async sendBidNotification(phoneNumber: string, data: {
    tenderTitle: string;
    action: string;
  }): Promise<SmsResponse> {
    const message = `Bid ${data.action} for tender: ${data.tenderTitle}. Check your email for details.`;
    return this.sendSms({ to: phoneNumber, message });
  }

  async sendContractNotification(phoneNumber: string, data: {
    contractNumber: string;
    action: string;
  }): Promise<SmsResponse> {
    const message = `Contract ${data.action}: ${data.contractNumber}. Check your email for details.`;
    return this.sendSms({ to: phoneNumber, message });
  }

  async sendPaymentNotification(phoneNumber: string, data: {
    paymentType: string;
    amount: number;
    status: string;
  }): Promise<SmsResponse> {
    const formattedAmount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(data.amount);

    const message = `Payment ${data.status}: ${data.paymentType} - ${formattedAmount}. Check your email for details.`;
    return this.sendSms({ to: phoneNumber, message });
  }

  async sendWorkflowNotification(phoneNumber: string, data: {
    stepName: string;
    action: 'approval_required' | 'approved' | 'rejected' | 'escalated';
  }): Promise<SmsResponse> {
    let message = '';
    
    switch (data.action) {
      case 'approval_required':
        message = `Workflow approval required: ${data.stepName}. Check your email for details.`;
        break;
      case 'approved':
        message = `Workflow step approved: ${data.stepName}`;
        break;
      case 'rejected':
        message = `Workflow step rejected: ${data.stepName}`;
        break;
      case 'escalated':
        message = `Workflow escalated: ${data.stepName}. Immediate action required.`;
        break;
    }

    return this.sendSms({ to: phoneNumber, message });
  }

  async sendAlert(phoneNumber: string, alertMessage: string): Promise<SmsResponse> {
    return this.sendSms({ to: phoneNumber, message: `ALERT: ${alertMessage}` });
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-numeric characters
    let cleaned = phoneNumber.replace(/\D/g, '');

    // If number doesn't start with country code, add India's country code
    if (!cleaned.startsWith('91') && cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }

    // Add + prefix
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }

    return cleaned;
  }

  async validatePhoneNumber(phoneNumber: string): Promise<boolean> {
    if (!this.isEnabled) {
      // Basic validation when Twilio is not available
      const cleaned = phoneNumber.replace(/\D/g, '');
      return cleaned.length >= 10 && cleaned.length <= 15;
    }

    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      const phoneNumberInfo = await this.twilioClient.lookups.v1
        .phoneNumbers(formattedNumber)
        .fetch();

      return phoneNumberInfo.phoneNumber !== null;
    } catch (error) {
      this.logger.error('Phone number validation failed:', error);
      return false;
    }
  }

  async getDeliveryStatus(messageId: string): Promise<{
    status: string;
    errorCode?: string;
    errorMessage?: string;
  }> {
    if (!this.isEnabled) {
      return { status: 'unknown' };
    }

    try {
      const message = await this.twilioClient.messages(messageId).fetch();
      
      return {
        status: message.status,
        errorCode: message.errorCode?.toString(),
        errorMessage: message.errorMessage,
      };
    } catch (error) {
      this.logger.error('Failed to get message status:', error);
      return { status: 'error', errorMessage: error.message };
    }
  }

  isServiceEnabled(): boolean {
    return this.isEnabled;
  }
}