import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Payment, PaymentStatus } from '../entities/payment.entity';
import { PaymentService } from '../services/payment.service';
import { NotificationService } from '../services/notification.service';
import { AuditService } from '../services/audit.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private configService: ConfigService,
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    private auditService: AuditService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('payment.stripe.secretKey'), {
      apiVersion: '2023-10-16',
    });
  }

  async handleStripeWebhook(rawBody: Buffer, signature: string): Promise<void> {
    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.configService.get<string>('payment.stripe.webhookSecret'),
      );
    } catch (err) {
      this.logger.error(`Stripe webhook signature verification failed: ${err.message}`);
      throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
    }

    this.logger.log(`Stripe webhook received: ${event.type}`);

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.canceled':
          await this.handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.requires_action':
          await this.handlePaymentIntentRequiresAction(event.data.object as Stripe.PaymentIntent);
          break;

        case 'charge.dispute.created':
          await this.handleChargeDisputeCreated(event.data.object as Stripe.Dispute);
          break;

        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        case 'invoice.finalized':
          await this.handleInvoiceFinalized(event.data.object as Stripe.Invoice);
          break;

        // Note: customer.source.chargeable event type has been deprecated in newer Stripe API versions

        default:
          this.logger.warn(`Unhandled Stripe webhook event type: ${event.type}`);
      }

      // Log successful webhook processing
      await this.auditService.logWebhookProcessed('stripe', event.type, event.id, true);

    } catch (error) {
      this.logger.error(`Error processing Stripe webhook ${event.type}: ${error.message}`, error.stack);
      
      // Log failed webhook processing
      await this.auditService.logWebhookProcessed('stripe', event.type, event.id, false, error.message);
      
      throw error;
    }
  }

  async handlePayPalWebhook(rawBody: Buffer, headers: Record<string, string>): Promise<void> {
    this.logger.log('Processing PayPal webhook');

    // In production, you would verify PayPal webhook signature here
    // For now, we'll parse the body and handle common events

    try {
      const body = JSON.parse(rawBody.toString());
      const eventType = body.event_type;

      this.logger.log(`PayPal webhook event type: ${eventType}`);

      switch (eventType) {
        case 'PAYMENT.CAPTURE.COMPLETED':
          await this.handlePayPalPaymentCaptureCompleted(body);
          break;

        case 'PAYMENT.CAPTURE.DENIED':
          await this.handlePayPalPaymentCaptureDenied(body);
          break;

        case 'BILLING.SUBSCRIPTION.ACTIVATED':
          await this.handlePayPalSubscriptionActivated(body);
          break;

        case 'BILLING.SUBSCRIPTION.CANCELLED':
          await this.handlePayPalSubscriptionCancelled(body);
          break;

        default:
          this.logger.warn(`Unhandled PayPal webhook event type: ${eventType}`);
      }

      // Log successful webhook processing
      await this.auditService.logWebhookProcessed('paypal', eventType, body.id, true);

    } catch (error) {
      this.logger.error(`Error processing PayPal webhook: ${error.message}`, error.stack);
      
      // Log failed webhook processing
      await this.auditService.logWebhookProcessed('paypal', 'unknown', 'unknown', false, error.message);
      
      throw error;
    }
  }

  async handleTestWebhook(body: any, headers: Record<string, string>): Promise<void> {
    this.logger.log('Processing test webhook for development/testing');
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Log test webhook
    await this.auditService.logWebhookProcessed('test', body.event_type || 'test_event', body.id || 'test_id', true);
  }

  // Stripe Event Handlers
  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const payment = await this.findPaymentByProviderPaymentId(paymentIntent.id);
    if (!payment) {
      this.logger.warn(`Payment not found for PaymentIntent: ${paymentIntent.id}`);
      return;
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      payment.markAsCompleted();
      await this.paymentRepository.save(payment);

      // Send success notification
      await this.notificationService.sendPaymentSuccessNotification(payment.userId, payment);

      this.logger.log(`Payment ${payment.id} marked as completed from webhook`);
    }
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const payment = await this.findPaymentByProviderPaymentId(paymentIntent.id);
    if (!payment) {
      this.logger.warn(`Payment not found for PaymentIntent: ${paymentIntent.id}`);
      return;
    }

    if (!payment.isFailed) {
      const errorMessage = paymentIntent.last_payment_error?.message || 'Payment failed';
      const errorCode = paymentIntent.last_payment_error?.code;
      
      payment.markAsFailed(errorMessage, errorCode);
      await this.paymentRepository.save(payment);

      // Send failure notification
      await this.notificationService.sendPaymentFailedNotification(payment.userId, payment);

      this.logger.log(`Payment ${payment.id} marked as failed from webhook: ${errorMessage}`);
    }
  }

  private async handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const payment = await this.findPaymentByProviderPaymentId(paymentIntent.id);
    if (!payment) {
      this.logger.warn(`Payment not found for PaymentIntent: ${paymentIntent.id}`);
      return;
    }

    if (payment.status !== PaymentStatus.CANCELLED) {
      payment.status = PaymentStatus.CANCELLED;
      await this.paymentRepository.save(payment);

      this.logger.log(`Payment ${payment.id} marked as cancelled from webhook`);
    }
  }

  private async handlePaymentIntentRequiresAction(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const payment = await this.findPaymentByProviderPaymentId(paymentIntent.id);
    if (!payment) {
      this.logger.warn(`Payment not found for PaymentIntent: ${paymentIntent.id}`);
      return;
    }

    // Notify user that action is required (e.g., 3D Secure authentication)
    this.logger.log(`Payment ${payment.id} requires additional action`);
    
    // You might want to send a notification to the user here
    // await this.notificationService.sendPaymentActionRequiredNotification(payment.userId, payment);
  }

  private async handleChargeDisputeCreated(dispute: Stripe.Dispute): Promise<void> {
    // Handle chargeback/dispute
    this.logger.warn(`Chargeback created for charge: ${dispute.charge}`);
    
    // Find the payment and mark it as disputed
    // Implement chargeback handling logic here
    
    // Notify admins about the dispute
    // await this.notificationService.sendDisputeNotification(dispute);
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    this.logger.log(`Subscription created: ${subscription.id}`);
    // Handle subscription creation logic
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    this.logger.log(`Subscription updated: ${subscription.id}`);
    // Handle subscription update logic
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    this.logger.log(`Subscription deleted: ${subscription.id}`);
    // Handle subscription cancellation logic
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    this.logger.log(`Invoice payment succeeded: ${invoice.id}`);
    // Handle invoice payment success logic
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    this.logger.log(`Invoice payment failed: ${invoice.id}`);
    // Handle invoice payment failure logic
  }

  private async handleInvoiceFinalized(invoice: Stripe.Invoice): Promise<void> {
    this.logger.log(`Invoice finalized: ${invoice.id}`);
    // Handle invoice finalization logic
  }

  private async handleCustomerSourceChargeable(source: Stripe.Source): Promise<void> {
    this.logger.log(`Customer source chargeable: ${source.id}`);
    // Handle chargeable source (e.g., for ACH payments)
  }

  // PayPal Event Handlers
  private async handlePayPalPaymentCaptureCompleted(body: any): Promise<void> {
    const captureId = body.resource.id;
    this.logger.log(`PayPal payment capture completed: ${captureId}`);
    
    // Find payment by PayPal capture ID and mark as completed
    // Implementation would depend on how you store PayPal payment references
  }

  private async handlePayPalPaymentCaptureDenied(body: any): Promise<void> {
    const captureId = body.resource.id;
    this.logger.log(`PayPal payment capture denied: ${captureId}`);
    
    // Find payment by PayPal capture ID and mark as failed
  }

  private async handlePayPalSubscriptionActivated(body: any): Promise<void> {
    const subscriptionId = body.resource.id;
    this.logger.log(`PayPal subscription activated: ${subscriptionId}`);
    
    // Handle PayPal subscription activation
  }

  private async handlePayPalSubscriptionCancelled(body: any): Promise<void> {
    const subscriptionId = body.resource.id;
    this.logger.log(`PayPal subscription cancelled: ${subscriptionId}`);
    
    // Handle PayPal subscription cancellation
  }

  // Helper methods
  private async findPaymentByProviderPaymentId(providerPaymentId: string): Promise<Payment | null> {
    return this.paymentRepository.findOne({
      where: { providerPaymentId },
      relations: ['paymentMethod'],
    });
  }

  // Webhook validation helpers
  private verifyPayPalWebhookSignature(rawBody: Buffer, headers: Record<string, string>): boolean {
    // Implement PayPal webhook signature verification
    // This is a simplified version - in production, you'd use PayPal's SDK
    try {
      const authAlgo = headers['paypal-auth-algo'];
      const transmissionId = headers['paypal-transmission-id'];
      const certId = headers['paypal-cert-id'];
      const transmissionSig = headers['paypal-transmission-sig'];
      const transmissionTime = headers['paypal-transmission-time'];

      // Verify signature using PayPal's public key
      // This would involve cryptographic verification
      
      return true; // Placeholder
    } catch (error) {
      this.logger.error(`PayPal webhook signature verification failed: ${error.message}`);
      return false;
    }
  }

  // Webhook retry logic
  async retryFailedWebhook(webhookId: string, eventType: string, maxRetries: number = 3): Promise<void> {
    this.logger.log(`Retrying failed webhook: ${webhookId}, event: ${eventType}`);
    
    // Implement webhook retry logic
    // This would typically involve queuing the webhook for retry with exponential backoff
  }

  // Webhook analytics
  async getWebhookStats(startDate: Date, endDate: Date): Promise<{
    totalWebhooks: number;
    successfulWebhooks: number;
    failedWebhooks: number;
    webhooksByProvider: Record<string, number>;
    webhooksByEventType: Record<string, number>;
  }> {
    // Implement webhook statistics gathering
    return {
      totalWebhooks: 0,
      successfulWebhooks: 0,
      failedWebhooks: 0,
      webhooksByProvider: {},
      webhooksByEventType: {},
    };
  }
}