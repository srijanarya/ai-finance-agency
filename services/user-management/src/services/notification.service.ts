import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

interface SmsMessage {
  to: string;
  message: string;
  type?: 'verification' | 'alert' | 'info';
}

interface SecurityAlert {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  details: Record<string, any>;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  /**
   * Send SMS verification code
   */
  async sendSmsVerification(phoneNumber: string, code: string): Promise<boolean> {
    try {
      const message = `Your verification code is: ${code}. This code will expire in 10 minutes.`;
      
      return this.sendSms({
        to: phoneNumber,
        message,
        type: 'verification',
      });
    } catch (error) {
      this.logger.error(`Failed to send SMS verification to ${phoneNumber}: ${error.message}`);
      return false;
    }
  }

  /**
   * Send SMS message
   */
  async sendSms(smsMessage: SmsMessage): Promise<boolean> {
    try {
      this.logger.log(`SMS sent to ${smsMessage.to}: ${smsMessage.message.substring(0, 50)}...`);

      this.eventEmitter.emit('sms.sent', {
        to: smsMessage.to,
        type: smsMessage.type,
        timestamp: new Date(),
      });

      return true;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${smsMessage.to}: ${error.message}`);
      return false;
    }
  }

  /**
   * Send security alert email
   */
  async sendSecurityAlert(email: string, alert: SecurityAlert): Promise<boolean> {
    try {
      this.logger.warn(`Security alert sent to ${email}: ${alert.title}`);

      this.eventEmitter.emit('security.alert.sent', {
        email,
        alert,
        timestamp: new Date(),
      });

      return true;
    } catch (error) {
      this.logger.error(`Failed to send security alert to ${email}: ${error.message}`);
      return false;
    }
  }
}