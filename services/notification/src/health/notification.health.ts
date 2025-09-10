import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { EmailService } from '../services/email.service';
import { SmsService } from '../services/sms.service';
import { PushNotificationService } from '../services/push-notification.service';

@Injectable()
export class NotificationHealthIndicator extends HealthIndicator {
  constructor(
    private emailService: EmailService,
    private smsService: SmsService,
    private pushService: PushNotificationService,
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const checks = {
        emailService: await this.checkEmailService(),
        smsService: this.checkSmsService(),
        pushService: this.checkPushService(),
      };

      const isHealthy = Object.values(checks).every(check => check === true);

      const result = this.getStatus(key, isHealthy, checks);

      if (isHealthy) {
        return result;
      }

      throw new HealthCheckError('Notification service health check failed', result);
    } catch (error) {
      const result = this.getStatus(key, false, { error: error.message });
      throw new HealthCheckError('Notification service health check failed', result);
    }
  }

  private async checkEmailService(): Promise<boolean> {
    try {
      return await this.emailService.verifyConnection();
    } catch (error) {
      return false;
    }
  }

  private checkSmsService(): boolean {
    try {
      return this.smsService.isServiceEnabled();
    } catch (error) {
      return false;
    }
  }

  private checkPushService(): boolean {
    try {
      return this.pushService.isServiceEnabled();
    } catch (error) {
      return false;
    }
  }
}