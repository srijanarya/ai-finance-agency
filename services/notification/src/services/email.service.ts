import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    const smtpConfig = {
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    };

    // Use test account for development if no SMTP config provided
    if (!smtpConfig.host && process.env.NODE_ENV === 'development') {
      this.createTestAccount();
      return;
    }

    try {
      this.transporter = nodemailer.createTransporter(smtpConfig);
      this.logger.log('Email transporter initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize email transporter', error.stack);
    }
  }

  private async createTestAccount(): Promise<void> {
    try {
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      this.logger.log(`Test email account created: ${testAccount.user}`);
      this.logger.log('Preview emails at: https://ethereal.email/messages');
    } catch (error) {
      this.logger.error('Failed to create test email account', error.stack);
    }
  }

  async sendNotification(notification: Notification): Promise<string> {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      // In a real implementation, you would fetch user email from user service
      const userEmail = await this.getUserEmail(notification.userId);
      
      const mailOptions = {
        from: this.configService.get<string>('EMAIL_FROM', 'noreply@aifinanceagency.com'),
        to: userEmail,
        subject: notification.title,
        text: notification.message,
        html: notification.payload?.htmlBody || this.convertToHtml(notification.message),
      };

      const info = await this.transporter.sendMail(mailOptions);

      this.logger.log(`Email sent successfully: ${info.messageId}`);
      
      // For test accounts, log the preview URL
      if (process.env.NODE_ENV === 'development') {
        this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }

      return info.messageId;
    } catch (error) {
      this.logger.error(`Failed to send email notification: ${notification.id}`, error.stack);
      throw error;
    }
  }

  async sendCustomEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<string> {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const mailOptions = {
        from: this.configService.get<string>('EMAIL_FROM', 'noreply@aifinanceagency.com'),
        to,
        subject,
        text,
        html: html || this.convertToHtml(text),
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Custom email sent successfully: ${info.messageId}`);

      return info.messageId;
    } catch (error) {
      this.logger.error('Failed to send custom email', error.stack);
      throw error;
    }
  }

  async sendBulkEmails(
    emails: Array<{
      to: string;
      subject: string;
      text: string;
      html?: string;
    }>,
  ): Promise<string[]> {
    const results: string[] = [];

    for (const email of emails) {
      try {
        const messageId = await this.sendCustomEmail(
          email.to,
          email.subject,
          email.text,
          email.html,
        );
        results.push(messageId);
      } catch (error) {
        this.logger.error(`Failed to send bulk email to ${email.to}`, error.stack);
        results.push(null);
      }
    }

    return results;
  }

  private async getUserEmail(userId: string): Promise<string> {
    // In a real implementation, this would call the user service via gRPC
    // For now, return a test email
    return `user-${userId}@example.com`;
  }

  private convertToHtml(text: string): string {
    return `
      <html>
        <body>
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">AI Finance Agency</h2>
            <div style="white-space: pre-wrap; line-height: 1.6;">
              ${text.replace(/\n/g, '<br>')}
            </div>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              This is an automated message from AI Finance Agency. 
              Please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `;
  }

  async verifyConnection(): Promise<boolean> {
    try {
      if (!this.transporter) {
        return false;
      }

      await this.transporter.verify();
      this.logger.log('Email service connection verified');
      return true;
    } catch (error) {
      this.logger.error('Email service connection failed', error.stack);
      return false;
    }
  }
}