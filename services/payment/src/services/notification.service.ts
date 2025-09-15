import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Payment } from '../entities/payment.entity';
import { Wallet } from '../entities/wallet.entity';
import { Subscription } from '../entities/subscription.entity';
import { Invoice } from '../entities/invoice.entity';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeEmailTransporter();
  }

  private initializeEmailTransporter(): void {
    const emailConfig = {
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    };

    if (emailConfig.host) {
      this.transporter = nodemailer.createTransport(emailConfig);
    } else {
      this.logger.warn('Email configuration not provided, email notifications disabled');
    }
  }

  // Payment Notifications
  async sendPaymentSuccessNotification(userId: string, payment: Payment): Promise<void> {
    const template = this.generatePaymentSuccessTemplate(payment);
    await this.sendEmail(userId, template);
    
    this.logger.log(`Payment success notification sent to user ${userId} for payment ${payment.id}`);
  }

  async sendPaymentFailedNotification(userId: string, payment: Payment): Promise<void> {
    const template = this.generatePaymentFailedTemplate(payment);
    await this.sendEmail(userId, template);
    
    this.logger.log(`Payment failed notification sent to user ${userId} for payment ${payment.id}`);
  }

  async sendRefundNotification(userId: string, payment: Payment, refundAmount: number): Promise<void> {
    const template = this.generateRefundTemplate(payment, refundAmount);
    await this.sendEmail(userId, template);
    
    this.logger.log(`Refund notification sent to user ${userId} for payment ${payment.id}, amount: ${refundAmount}`);
  }

  // Subscription Notifications
  async sendSubscriptionActivatedNotification(userId: string, subscription: Subscription): Promise<void> {
    const template = this.generateSubscriptionActivatedTemplate(subscription);
    await this.sendEmail(userId, template);
    
    this.logger.log(`Subscription activated notification sent to user ${userId} for subscription ${subscription.id}`);
  }

  async sendSubscriptionCancelledNotification(userId: string, subscription: Subscription): Promise<void> {
    const template = this.generateSubscriptionCancelledTemplate(subscription);
    await this.sendEmail(userId, template);
    
    this.logger.log(`Subscription cancelled notification sent to user ${userId} for subscription ${subscription.id}`);
  }

  async sendSubscriptionRenewalNotification(userId: string, subscription: Subscription): Promise<void> {
    const template = this.generateSubscriptionRenewalTemplate(subscription);
    await this.sendEmail(userId, template);
    
    this.logger.log(`Subscription renewal notification sent to user ${userId} for subscription ${subscription.id}`);
  }

  async sendSubscriptionExpiringNotification(userId: string, subscription: Subscription, daysUntilExpiry: number): Promise<void> {
    const template = this.generateSubscriptionExpiringTemplate(subscription, daysUntilExpiry);
    await this.sendEmail(userId, template);
    
    this.logger.log(`Subscription expiring notification sent to user ${userId} for subscription ${subscription.id}`);
  }

  // Invoice Notifications
  async sendInvoiceGeneratedNotification(userId: string, invoice: Invoice): Promise<void> {
    const template = this.generateInvoiceGeneratedTemplate(invoice);
    await this.sendEmail(userId, template);
    
    this.logger.log(`Invoice generated notification sent to user ${userId} for invoice ${invoice.id}`);
  }

  async sendInvoiceOverdueNotification(userId: string, invoice: Invoice): Promise<void> {
    const template = this.generateInvoiceOverdueTemplate(invoice);
    await this.sendEmail(userId, template);
    
    this.logger.log(`Invoice overdue notification sent to user ${userId} for invoice ${invoice.id}`);
  }

  async sendInvoicePaidNotification(userId: string, invoice: Invoice): Promise<void> {
    const template = this.generateInvoicePaidTemplate(invoice);
    await this.sendEmail(userId, template);
    
    this.logger.log(`Invoice paid notification sent to user ${userId} for invoice ${invoice.id}`);
  }

  // Wallet Notifications
  async sendLargeWithdrawalNotification(userId: string, wallet: Wallet, amount: number): Promise<void> {
    const template = this.generateLargeWithdrawalTemplate(wallet, amount);
    await this.sendEmail(userId, template);
    
    this.logger.log(`Large withdrawal notification sent to user ${userId} for wallet ${wallet.id}, amount: ${amount}`);
  }

  async sendLowBalanceNotification(userId: string, wallet: Wallet, threshold: number): Promise<void> {
    const template = this.generateLowBalanceTemplate(wallet, threshold);
    await this.sendEmail(userId, template);
    
    this.logger.log(`Low balance notification sent to user ${userId} for wallet ${wallet.id}`);
  }

  // Security Notifications
  async sendSuspiciousActivityNotification(userId: string, activity: string, details: any): Promise<void> {
    const template = this.generateSuspiciousActivityTemplate(activity, details);
    await this.sendEmail(userId, template);
    
    this.logger.log(`Suspicious activity notification sent to user ${userId}: ${activity}`);
  }

  // Email sending logic
  private async sendEmail(userId: string, template: EmailTemplate): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`Cannot send email to user ${userId}: Email transporter not configured`);
      return;
    }

    try {
      // In production, you would fetch user email from user service
      const userEmail = await this.getUserEmail(userId);
      
      if (!userEmail) {
        this.logger.warn(`Cannot send email to user ${userId}: Email address not found`);
        return;
      }

      const mailOptions = {
        from: this.configService.get<string>('EMAIL_FROM', 'noreply@tradingplatform.com'),
        to: userEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.debug(`Email sent successfully to ${userEmail}`);

    } catch (error) {
      this.logger.error(`Failed to send email to user ${userId}`, error.stack);
    }
  }

  private async getUserEmail(userId: string): Promise<string | null> {
    // In production, this would call the user service to get the email
    // For now, return a placeholder
    return `user-${userId}@example.com`;
  }

  // Template generators
  private generatePaymentSuccessTemplate(payment: Payment): EmailTemplate {
    return {
      subject: 'Payment Confirmation - Trading Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Payment Successful</h2>
          <p>Your payment has been processed successfully.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Payment Details</h3>
            <p><strong>Amount:</strong> ${payment.amount.toFixed(2)} ${payment.currency}</p>
            <p><strong>Transaction ID:</strong> ${payment.id}</p>
            <p><strong>Date:</strong> ${payment.processedAt?.toLocaleDateString()}</p>
            ${payment.description ? `<p><strong>Description:</strong> ${payment.description}</p>` : ''}
          </div>
          
          <p>Thank you for using our platform!</p>
        </div>
      `,
      text: `Payment Successful\n\nYour payment of ${payment.amount.toFixed(2)} ${payment.currency} has been processed successfully.\n\nTransaction ID: ${payment.id}\nDate: ${payment.processedAt?.toLocaleDateString()}\n\nThank you for using our platform!`,
    };
  }

  private generatePaymentFailedTemplate(payment: Payment): EmailTemplate {
    return {
      subject: 'Payment Failed - Trading Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Payment Failed</h2>
          <p>Unfortunately, your payment could not be processed.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Payment Details</h3>
            <p><strong>Amount:</strong> ${payment.amount.toFixed(2)} ${payment.currency}</p>
            <p><strong>Transaction ID:</strong> ${payment.id}</p>
            <p><strong>Reason:</strong> ${payment.failureReason || 'Unknown error'}</p>
          </div>
          
          <p>Please try again or contact support if the problem persists.</p>
        </div>
      `,
      text: `Payment Failed\n\nYour payment of ${payment.amount.toFixed(2)} ${payment.currency} could not be processed.\n\nTransaction ID: ${payment.id}\nReason: ${payment.failureReason || 'Unknown error'}\n\nPlease try again or contact support.`,
    };
  }

  private generateRefundTemplate(payment: Payment, refundAmount: number): EmailTemplate {
    return {
      subject: 'Refund Processed - Trading Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #17a2b8;">Refund Processed</h2>
          <p>A refund has been processed for your payment.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Refund Details</h3>
            <p><strong>Refund Amount:</strong> ${refundAmount.toFixed(2)} ${payment.currency}</p>
            <p><strong>Original Payment:</strong> ${payment.amount.toFixed(2)} ${payment.currency}</p>
            <p><strong>Transaction ID:</strong> ${payment.id}</p>
          </div>
          
          <p>The refund will appear in your account within 3-5 business days.</p>
        </div>
      `,
      text: `Refund Processed\n\nA refund of ${refundAmount.toFixed(2)} ${payment.currency} has been processed for your payment.\n\nOriginal Payment: ${payment.amount.toFixed(2)} ${payment.currency}\nTransaction ID: ${payment.id}\n\nThe refund will appear in your account within 3-5 business days.`,
    };
  }

  private generateSubscriptionActivatedTemplate(subscription: Subscription): EmailTemplate {
    return {
      subject: 'Subscription Activated - Trading Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Subscription Activated</h2>
          <p>Your subscription has been activated successfully!</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Subscription Details</h3>
            <p><strong>Plan:</strong> ${subscription.planId}</p>
            <p><strong>Billing Cycle:</strong> ${subscription.billingCycle}</p>
            <p><strong>Next Billing Date:</strong> ${subscription.nextBillingDate.toLocaleDateString()}</p>
            <p><strong>Amount:</strong> ${subscription.currentPrice.toFixed(2)} ${subscription.currentCurrency}</p>
          </div>
          
          <p>You now have access to all premium features!</p>
        </div>
      `,
      text: `Subscription Activated\n\nYour subscription has been activated successfully!\n\nPlan: ${subscription.planId}\nBilling Cycle: ${subscription.billingCycle}\nNext Billing Date: ${subscription.nextBillingDate.toLocaleDateString()}\nAmount: ${subscription.currentPrice.toFixed(2)} ${subscription.currentCurrency}\n\nYou now have access to all premium features!`,
    };
  }

  private generateSubscriptionCancelledTemplate(subscription: Subscription): EmailTemplate {
    return {
      subject: 'Subscription Cancelled - Trading Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Subscription Cancelled</h2>
          <p>Your subscription has been cancelled.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Cancellation Details</h3>
            <p><strong>Plan:</strong> ${subscription.planId}</p>
            <p><strong>End Date:</strong> ${subscription.currentPeriodEnd.toLocaleDateString()}</p>
          </div>
          
          <p>You'll continue to have access to premium features until ${subscription.currentPeriodEnd.toLocaleDateString()}.</p>
          <p>We're sorry to see you go! You can reactivate anytime.</p>
        </div>
      `,
      text: `Subscription Cancelled\n\nYour subscription has been cancelled.\n\nPlan: ${subscription.planId}\nEnd Date: ${subscription.currentPeriodEnd.toLocaleDateString()}\n\nYou'll continue to have access until ${subscription.currentPeriodEnd.toLocaleDateString()}.\n\nWe're sorry to see you go! You can reactivate anytime.`,
    };
  }

  private generateSubscriptionRenewalTemplate(subscription: Subscription): EmailTemplate {
    return {
      subject: 'Subscription Renewed - Trading Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Subscription Renewed</h2>
          <p>Your subscription has been automatically renewed.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Renewal Details</h3>
            <p><strong>Plan:</strong> ${subscription.planId}</p>
            <p><strong>Amount Charged:</strong> ${subscription.totalWithTax.toFixed(2)} ${subscription.currentCurrency}</p>
            <p><strong>Next Billing Date:</strong> ${subscription.nextBillingDate.toLocaleDateString()}</p>
          </div>
          
          <p>Thank you for continuing with us!</p>
        </div>
      `,
      text: `Subscription Renewed\n\nYour subscription has been automatically renewed.\n\nPlan: ${subscription.planId}\nAmount Charged: ${subscription.totalWithTax.toFixed(2)} ${subscription.currentCurrency}\nNext Billing Date: ${subscription.nextBillingDate.toLocaleDateString()}\n\nThank you for continuing with us!`,
    };
  }

  private generateSubscriptionExpiringTemplate(subscription: Subscription, daysUntilExpiry: number): EmailTemplate {
    return {
      subject: 'Subscription Expiring Soon - Trading Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ffc107;">Subscription Expiring Soon</h2>
          <p>Your subscription will expire in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Subscription Details</h3>
            <p><strong>Plan:</strong> ${subscription.planId}</p>
            <p><strong>Expiry Date:</strong> ${subscription.currentPeriodEnd.toLocaleDateString()}</p>
          </div>
          
          <p>Renew now to continue enjoying premium features!</p>
        </div>
      `,
      text: `Subscription Expiring Soon\n\nYour subscription will expire in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? '' : 's'}.\n\nPlan: ${subscription.planId}\nExpiry Date: ${subscription.currentPeriodEnd.toLocaleDateString()}\n\nRenew now to continue enjoying premium features!`,
    };
  }

  private generateInvoiceGeneratedTemplate(invoice: Invoice): EmailTemplate {
    return {
      subject: `Invoice ${invoice.invoiceNumber} - Trading Platform`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #17a2b8;">New Invoice Generated</h2>
          <p>A new invoice has been generated for your account.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Invoice Details</h3>
            <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Amount:</strong> ${invoice.totalAmount.toFixed(2)} ${invoice.currency}</p>
            <p><strong>Due Date:</strong> ${invoice.dueDate.toLocaleDateString()}</p>
          </div>
          
          <p>Please pay by the due date to avoid service interruption.</p>
        </div>
      `,
      text: `New Invoice Generated\n\nInvoice Number: ${invoice.invoiceNumber}\nAmount: ${invoice.totalAmount.toFixed(2)} ${invoice.currency}\nDue Date: ${invoice.dueDate.toLocaleDateString()}\n\nPlease pay by the due date to avoid service interruption.`,
    };
  }

  private generateInvoiceOverdueTemplate(invoice: Invoice): EmailTemplate {
    return {
      subject: `Overdue Invoice ${invoice.invoiceNumber} - Trading Platform`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Invoice Overdue</h2>
          <p>Your invoice is now overdue. Please make payment as soon as possible.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Invoice Details</h3>
            <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Amount Due:</strong> ${invoice.amountDue.toFixed(2)} ${invoice.currency}</p>
            <p><strong>Days Overdue:</strong> ${invoice.daysOverdue}</p>
          </div>
          
          <p>Late fees may apply. Please contact us if you need assistance.</p>
        </div>
      `,
      text: `Invoice Overdue\n\nInvoice Number: ${invoice.invoiceNumber}\nAmount Due: ${invoice.amountDue.toFixed(2)} ${invoice.currency}\nDays Overdue: ${invoice.daysOverdue}\n\nPlease make payment as soon as possible. Contact us if you need assistance.`,
    };
  }

  private generateInvoicePaidTemplate(invoice: Invoice): EmailTemplate {
    return {
      subject: `Invoice Paid ${invoice.invoiceNumber} - Trading Platform`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Invoice Paid</h2>
          <p>Thank you! Your invoice has been paid in full.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Payment Details</h3>
            <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Amount Paid:</strong> ${invoice.totalAmount.toFixed(2)} ${invoice.currency}</p>
            <p><strong>Paid Date:</strong> ${invoice.paidAt?.toLocaleDateString()}</p>
          </div>
          
          <p>Your services will continue uninterrupted.</p>
        </div>
      `,
      text: `Invoice Paid\n\nThank you! Your invoice has been paid in full.\n\nInvoice Number: ${invoice.invoiceNumber}\nAmount Paid: ${invoice.totalAmount.toFixed(2)} ${invoice.currency}\nPaid Date: ${invoice.paidAt?.toLocaleDateString()}\n\nYour services will continue uninterrupted.`,
    };
  }

  private generateLargeWithdrawalTemplate(wallet: Wallet, amount: number): EmailTemplate {
    return {
      subject: 'Large Withdrawal Alert - Trading Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ffc107;">Large Withdrawal Alert</h2>
          <p>A large withdrawal has been processed from your wallet.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Transaction Details</h3>
            <p><strong>Amount:</strong> ${amount.toFixed(8)} ${wallet.currency}</p>
            <p><strong>Wallet:</strong> ${wallet.type} (${wallet.id})</p>
            <p><strong>Remaining Balance:</strong> ${wallet.balance.toFixed(8)} ${wallet.currency}</p>
          </div>
          
          <p>If you didn't authorize this transaction, please contact support immediately.</p>
        </div>
      `,
      text: `Large Withdrawal Alert\n\nA large withdrawal of ${amount.toFixed(8)} ${wallet.currency} has been processed from your ${wallet.type} wallet.\n\nRemaining Balance: ${wallet.balance.toFixed(8)} ${wallet.currency}\n\nIf you didn't authorize this transaction, please contact support immediately.`,
    };
  }

  private generateLowBalanceTemplate(wallet: Wallet, threshold: number): EmailTemplate {
    return {
      subject: 'Low Balance Alert - Trading Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ffc107;">Low Balance Alert</h2>
          <p>Your wallet balance is running low.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Wallet Details</h3>
            <p><strong>Current Balance:</strong> ${wallet.balance.toFixed(8)} ${wallet.currency}</p>
            <p><strong>Available Balance:</strong> ${wallet.availableBalance.toFixed(8)} ${wallet.currency}</p>
            <p><strong>Wallet:</strong> ${wallet.type} (${wallet.id})</p>
            <p><strong>Threshold:</strong> ${threshold.toFixed(8)} ${wallet.currency}</p>
          </div>
          
          <p>Consider adding funds to continue trading without interruption.</p>
        </div>
      `,
      text: `Low Balance Alert\n\nYour ${wallet.type} wallet balance is running low.\n\nCurrent Balance: ${wallet.balance.toFixed(8)} ${wallet.currency}\nAvailable Balance: ${wallet.availableBalance.toFixed(8)} ${wallet.currency}\nThreshold: ${threshold.toFixed(8)} ${wallet.currency}\n\nConsider adding funds to continue trading.`,
    };
  }

  private generateSuspiciousActivityTemplate(activity: string, details: any): EmailTemplate {
    return {
      subject: 'Security Alert - Trading Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Security Alert</h2>
          <p>Suspicious activity has been detected on your account.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Activity Details</h3>
            <p><strong>Activity:</strong> ${activity}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Details:</strong> ${JSON.stringify(details, null, 2)}</p>
          </div>
          
          <p>If this was not you, please contact support immediately and consider changing your password.</p>
        </div>
      `,
      text: `Security Alert\n\nSuspicious activity detected: ${activity}\nTime: ${new Date().toLocaleString()}\nDetails: ${JSON.stringify(details)}\n\nIf this was not you, please contact support immediately.`,
    };
  }
}