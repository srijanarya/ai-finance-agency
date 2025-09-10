import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {}

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${this.configService.get('CLIENT_URL')}/verify-email?token=${token}`;

    // For now, just log the verification email
    // In production, integrate with email service like SendGrid, Mailgun, etc.
    this.logger.log(
      `Verification email would be sent to ${email} with URL: ${verificationUrl}`,
    );

    // TODO: Implement actual email sending
    /*
    const emailData = {
      to: email,
      subject: 'Verify Your Email Address',
      template: 'email-verification',
      data: {
        verificationUrl,
      },
    };
    
    await this.emailProvider.sendEmail(emailData);
    */
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.configService.get('CLIENT_URL')}/reset-password?token=${token}`;

    // For now, just log the reset email
    // In production, integrate with email service
    this.logger.log(
      `Password reset email would be sent to ${email} with URL: ${resetUrl}`,
    );

    // TODO: Implement actual email sending
    /*
    const emailData = {
      to: email,
      subject: 'Reset Your Password',
      template: 'password-reset',
      data: {
        resetUrl,
      },
    };
    
    await this.emailProvider.sendEmail(emailData);
    */
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    // For now, just log the welcome email
    this.logger.log(`Welcome email would be sent to ${email} for ${firstName}`);

    // TODO: Implement actual email sending
  }

  async sendTwoFactorSetupEmail(email: string): Promise<void> {
    // For now, just log the 2FA setup email
    this.logger.log(
      `Two-factor authentication setup email would be sent to ${email}`,
    );

    // TODO: Implement actual email sending
  }
}
