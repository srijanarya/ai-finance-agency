import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private twilioClient: Twilio;
  private isEnabled: boolean;

  constructor(private configService: ConfigService) {
    this.initializeTwilio();
  }

  private initializeTwilio(): void {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    if (accountSid && authToken) {
      try {
        this.twilioClient = new Twilio(accountSid, authToken);
        this.isEnabled = true;
        this.logger.log('Twilio SMS service initialized successfully');
      } catch (error) {
        this.logger.error('Failed to initialize Twilio SMS service', error.stack);
        this.isEnabled = false;
      }
    } else {
      this.logger.warn('Twilio credentials not provided, SMS service disabled');
      this.isEnabled = false;
    }
  }

  async sendNotification(notification: Notification): Promise<string> {
    try {
      if (!this.isEnabled) {
        throw new Error('SMS service is not enabled');
      }

      // In a real implementation, you would fetch user phone from user service
      const userPhone = await this.getUserPhone(notification.userId);
      
      if (!userPhone) {
        throw new Error('User phone number not found');
      }

      const fromNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER');
      if (!fromNumber) {
        throw new Error('Twilio phone number not configured');
      }

      const message = await this.twilioClient.messages.create({
        body: this.formatMessage(notification),
        from: fromNumber,
        to: userPhone,
      });

      this.logger.log(`SMS sent successfully: ${message.sid}`);
      return message.sid;
    } catch (error) {
      this.logger.error(`Failed to send SMS notification: ${notification.id}`, error.stack);
      throw error;
    }
  }

  async sendCustomSms(
    to: string,
    message: string,
  ): Promise<string> {
    try {
      if (!this.isEnabled) {
        throw new Error('SMS service is not enabled');
      }

      const fromNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER');
      if (!fromNumber) {
        throw new Error('Twilio phone number not configured');
      }

      const twilioMessage = await this.twilioClient.messages.create({
        body: message,
        from: fromNumber,
        to: to,
      });

      this.logger.log(`Custom SMS sent successfully: ${twilioMessage.sid}`);
      return twilioMessage.sid;
    } catch (error) {
      this.logger.error(`Failed to send custom SMS to ${to}`, error.stack);
      throw error;
    }
  }

  async sendBulkSms(
    messages: Array<{
      to: string;
      message: string;
    }>,
  ): Promise<string[]> {
    const results: string[] = [];

    for (const sms of messages) {
      try {
        const messageId = await this.sendCustomSms(sms.to, sms.message);
        results.push(messageId);
      } catch (error) {
        this.logger.error(`Failed to send bulk SMS to ${sms.to}`, error.stack);
        results.push(null);
      }
    }

    return results;
  }

  async getMessageStatus(messageSid: string): Promise<any> {
    try {
      if (!this.isEnabled) {
        throw new Error('SMS service is not enabled');
      }

      const message = await this.twilioClient.messages(messageSid).fetch();
      return {
        sid: message.sid,
        status: message.status,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
        dateCreated: message.dateCreated,
        dateSent: message.dateSent,
        dateUpdated: message.dateUpdated,
      };
    } catch (error) {
      this.logger.error(`Failed to get SMS status for ${messageSid}`, error.stack);
      throw error;
    }
  }

  private async getUserPhone(userId: string): Promise<string | null> {
    // In a real implementation, this would call the user service via gRPC
    // For now, return null to simulate missing phone number
    this.logger.warn(`Phone number lookup not implemented for user ${userId}`);
    return null;
  }

  private formatMessage(notification: Notification): string {
    const maxLength = 160; // Standard SMS length limit
    
    let message = `${notification.title}\n\n${notification.message}`;
    
    // Add footer
    const footer = '\n\n- AI Finance Agency';
    const availableLength = maxLength - footer.length;
    
    if (message.length > availableLength) {
      message = message.substring(0, availableLength - 3) + '...';
    }
    
    return message + footer;
  }

  async validatePhoneNumber(phoneNumber: string): Promise<boolean> {
    try {
      if (!this.isEnabled) {
        return false;
      }

      const lookup = await this.twilioClient.lookups.v1
        .phoneNumbers(phoneNumber)
        .fetch();

      return !!lookup.phoneNumber;
    } catch (error) {
      this.logger.error(`Phone number validation failed for ${phoneNumber}`, error.stack);
      return false;
    }
  }

  isServiceEnabled(): boolean {
    return this.isEnabled;
  }

  async getAccountInfo(): Promise<any> {
    try {
      if (!this.isEnabled) {
        throw new Error('SMS service is not enabled');
      }

      const account = await this.twilioClient.api.accounts.get();
      return {
        sid: account.sid,
        friendlyName: account.friendlyName,
        status: account.status,
        type: account.type,
      };
    } catch (error) {
      this.logger.error('Failed to get Twilio account info', error.stack);
      throw error;
    }
  }
}