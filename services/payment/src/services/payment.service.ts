import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentStatus, PaymentType } from '../entities/payment.entity';
import { PaymentMethod } from '../entities/payment-method.entity';
import { Transaction, TransactionType } from '../entities/transaction.entity';
import { CreatePaymentDto, RefundPaymentDto, PaymentQueryDto, PaymentSummaryDto } from '../dto/payment.dto';
import { TaxService } from './tax.service';
import { WalletService } from './wallet.service';
import { NotificationService } from './notification.service';
import { AuditService } from './audit.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private stripe: Stripe;

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(PaymentMethod)
    private paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private configService: ConfigService,
    private taxService: TaxService,
    private walletService: WalletService,
    private notificationService: NotificationService,
    private auditService: AuditService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async createPayment(userId: string, createPaymentDto: CreatePaymentDto): Promise<Payment> {
    this.logger.log(`Creating payment for user ${userId}`);
    
    try {
      // Validate payment method if provided
      let paymentMethod: PaymentMethod;
      if (createPaymentDto.paymentMethodId) {
        paymentMethod = await this.paymentMethodRepository.findOne({
          where: { id: createPaymentDto.paymentMethodId, userId },
        });
        
        if (!paymentMethod) {
          throw new NotFoundException('Payment method not found');
        }

        if (!paymentMethod.canBeUsedForPayment()) {
          throw new BadRequestException('Payment method cannot be used for payments');
        }
      }

      // Calculate tax
      const taxAmount = await this.taxService.calculateTax(
        createPaymentDto.amount,
        createPaymentDto.currency,
        createPaymentDto.billingAddress?.country,
        createPaymentDto.billingAddress?.state,
      );

      // Calculate fees (e.g., Stripe fees)
      const feeAmount = this.calculateProcessingFee(createPaymentDto.amount, createPaymentDto.currency);
      const netAmount = createPaymentDto.amount - feeAmount;

      // Create Stripe PaymentIntent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round((createPaymentDto.amount + taxAmount) * 100), // Convert to cents
        currency: createPaymentDto.currency.toLowerCase(),
        payment_method: paymentMethod?.providerPaymentMethodId,
        confirmation_method: 'manual',
        confirm: createPaymentDto.confirmImmediately || false,
        description: createPaymentDto.description,
        metadata: {
          userId,
          type: createPaymentDto.type,
          ...(createPaymentDto.metadata || {}),
        },
      });

      // Create payment entity
      const payment = this.paymentRepository.create({
        userId,
        paymentIntentId: paymentIntent.id,
        amount: createPaymentDto.amount,
        currency: createPaymentDto.currency,
        type: createPaymentDto.type,
        status: this.mapStripeStatusToPaymentStatus(paymentIntent.status),
        paymentMethodId: createPaymentDto.paymentMethodId,
        invoiceId: createPaymentDto.invoiceId,
        subscriptionId: createPaymentDto.subscriptionId,
        description: createPaymentDto.description,
        metadata: createPaymentDto.metadata,
        providerPaymentId: paymentIntent.id,
        providerName: 'stripe',
        taxAmount,
        feeAmount,
        netAmount,
      });

      const savedPayment = await this.paymentRepository.save(payment);

      // Create transaction record
      const transaction = Transaction.createPaymentTransaction(
        userId,
        savedPayment.id,
        createPaymentDto.amount,
        createPaymentDto.currency,
        createPaymentDto.description,
      );

      await this.transactionRepository.save(transaction);

      // Log audit trail
      await this.auditService.logPaymentCreated(savedPayment, userId);

      this.logger.log(`Payment created successfully: ${savedPayment.id}`);
      return savedPayment;

    } catch (error) {
      this.logger.error(`Failed to create payment for user ${userId}`, error.stack);
      throw error;
    }
  }

  async confirmPayment(paymentId: string, paymentMethodId: string): Promise<Payment> {
    this.logger.log(`Confirming payment ${paymentId}`);

    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Payment cannot be confirmed in current status');
    }

    try {
      // Get payment method
      const paymentMethod = await this.paymentMethodRepository.findOne({
        where: { id: paymentMethodId, userId: payment.userId },
      });

      if (!paymentMethod) {
        throw new NotFoundException('Payment method not found');
      }

      // Confirm with Stripe
      const paymentIntent = await this.stripe.paymentIntents.confirm(payment.paymentIntentId, {
        payment_method: paymentMethod.providerPaymentMethodId,
      });

      // Update payment status
      payment.status = this.mapStripeStatusToPaymentStatus(paymentIntent.status);
      
      if (paymentIntent.status === 'succeeded') {
        payment.markAsCompleted();
      } else if (paymentIntent.status === 'canceled' || paymentIntent.last_payment_error) {
        payment.markAsFailed(
          paymentIntent.last_payment_error?.message || 'Payment failed',
          paymentIntent.last_payment_error?.code,
        );
      }

      const updatedPayment = await this.paymentRepository.save(payment);

      // Update transaction status
      const transaction = await this.transactionRepository.findOne({
        where: { paymentId: payment.id, type: TransactionType.PAYMENT },
      });

      if (transaction) {
        if (payment.isCompleted) {
          transaction.markAsCompleted();
        } else if (payment.isFailed) {
          transaction.markAsFailed(payment.failureReason, payment.failureCode);
        }
        await this.transactionRepository.save(transaction);
      }

      // Handle post-payment actions
      if (payment.isCompleted) {
        await this.handleSuccessfulPayment(updatedPayment);
      }

      // Log audit trail
      await this.auditService.logPaymentConfirmed(updatedPayment, paymentMethodId);

      return updatedPayment;

    } catch (error) {
      this.logger.error(`Failed to confirm payment ${paymentId}`, error.stack);
      
      // Update payment with failure info
      payment.markAsFailed(error.message, error.code);
      await this.paymentRepository.save(payment);
      
      throw error;
    }
  }

  async refundPayment(paymentId: string, refundDto: RefundPaymentDto, userId?: string): Promise<Payment> {
    this.logger.log(`Processing refund for payment ${paymentId}`);

    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (userId && payment.userId !== userId) {
      throw new BadRequestException('Payment does not belong to user');
    }

    const refundAmount = refundDto.amount || payment.availableRefundAmount;
    
    if (!payment.canRefund(refundAmount)) {
      throw new BadRequestException('Payment cannot be refunded or insufficient refund amount available');
    }

    try {
      // Process refund with Stripe
      const refund = await this.stripe.refunds.create({
        payment_intent: payment.paymentIntentId,
        amount: Math.round(refundAmount * 100), // Convert to cents
        reason: this.mapRefundReason(refundDto.reason),
        metadata: refundDto.metadata || {},
      });

      // Update payment with refund information
      payment.addRefund(refundAmount);
      const updatedPayment = await this.paymentRepository.save(payment);

      // Create refund transaction
      const refundTransaction = Transaction.createRefundTransaction(
        payment.userId,
        payment.id,
        refundAmount,
        payment.currency,
        refundDto.reason || 'Payment refund',
      );

      refundTransaction.providerTransactionId = refund.id;
      refundTransaction.markAsCompleted();
      await this.transactionRepository.save(refundTransaction);

      // Credit user wallet if applicable
      if (payment.type === PaymentType.WALLET_DEPOSIT) {
        await this.walletService.deposit(
          payment.userId,
          payment.currency,
          refundAmount,
          'Refund credit',
        );
      }

      // Send notification
      await this.notificationService.sendRefundNotification(
        payment.userId,
        updatedPayment,
        refundAmount,
      );

      // Log audit trail
      await this.auditService.logPaymentRefunded(updatedPayment, refundAmount, refundDto.reason);

      this.logger.log(`Refund processed successfully for payment ${paymentId}: ${refundAmount}`);
      return updatedPayment;

    } catch (error) {
      this.logger.error(`Failed to process refund for payment ${paymentId}`, error.stack);
      throw error;
    }
  }

  async getPayment(paymentId: string, userId?: string): Promise<Payment> {
    const whereClause: any = { id: paymentId };
    if (userId) {
      whereClause.userId = userId;
    }

    const payment = await this.paymentRepository.findOne({
      where: whereClause,
      relations: ['paymentMethod', 'transactions', 'invoice', 'subscription'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async getUserPayments(userId: string, queryDto: PaymentQueryDto): Promise<{
    payments: Payment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, ...filters } = queryDto;
    const offset = (page - 1) * limit;

    const whereClause: any = { userId };
    
    // Apply filters
    if (filters.status) {
      whereClause.status = filters.status;
    }
    
    if (filters.type) {
      whereClause.type = filters.type;
    }
    
    if (filters.currency) {
      whereClause.currency = filters.currency;
    }

    // Date range filter
    if (filters.dateFrom && filters.dateTo) {
      whereClause.createdAt = Between(new Date(filters.dateFrom), new Date(filters.dateTo));
    } else if (filters.dateFrom) {
      whereClause.createdAt = MoreThanOrEqual(new Date(filters.dateFrom));
    } else if (filters.dateTo) {
      whereClause.createdAt = LessThanOrEqual(new Date(filters.dateTo));
    }

    // Amount range filter
    if (filters.minAmount && filters.maxAmount) {
      whereClause.amount = Between(filters.minAmount, filters.maxAmount);
    } else if (filters.minAmount) {
      whereClause.amount = MoreThanOrEqual(filters.minAmount);
    } else if (filters.maxAmount) {
      whereClause.amount = LessThanOrEqual(filters.maxAmount);
    }

    const findOptions: FindManyOptions<Payment> = {
      where: whereClause,
      relations: ['paymentMethod'],
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    };

    // Text search in description
    if (filters.search) {
      delete findOptions.where;
      findOptions.where = [
        { ...whereClause, description: `%${filters.search}%` },
      ];
    }

    const [payments, total] = await this.paymentRepository.findAndCount(findOptions);

    return {
      payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPaymentSummary(userId: string, currency?: string): Promise<PaymentSummaryDto> {
    const whereClause: any = { userId };
    if (currency) {
      whereClause.currency = currency;
    }

    const payments = await this.paymentRepository.find({
      where: whereClause,
    });

    const summary: PaymentSummaryDto = {
      totalPayments: payments.length,
      totalAmount: 0,
      currency: currency || 'USD',
      completedPayments: 0,
      completedAmount: 0,
      failedPayments: 0,
      failedAmount: 0,
      pendingPayments: 0,
      pendingAmount: 0,
      refundedPayments: 0,
      totalRefundedAmount: 0,
      totalFeesAmount: 0,
      totalTaxAmount: 0,
      totalNetAmount: 0,
    };

    for (const payment of payments) {
      summary.totalAmount += payment.amount;
      summary.totalFeesAmount += payment.feeAmount;
      summary.totalTaxAmount += payment.taxAmount;
      summary.totalNetAmount += payment.netAmount;

      if (payment.refundedAmount > 0) {
        summary.refundedPayments++;
        summary.totalRefundedAmount += payment.refundedAmount;
      }

      switch (payment.status) {
        case PaymentStatus.COMPLETED:
          summary.completedPayments++;
          summary.completedAmount += payment.amount;
          break;
        case PaymentStatus.FAILED:
        case PaymentStatus.CANCELLED:
          summary.failedPayments++;
          summary.failedAmount += payment.amount;
          break;
        case PaymentStatus.PENDING:
        case PaymentStatus.PROCESSING:
          summary.pendingPayments++;
          summary.pendingAmount += payment.amount;
          break;
      }
    }

    return summary;
  }

  async cancelPayment(paymentId: string, userId?: string): Promise<Payment> {
    const payment = await this.getPayment(paymentId, userId);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Only pending payments can be cancelled');
    }

    try {
      // Cancel with Stripe
      await this.stripe.paymentIntents.cancel(payment.paymentIntentId);

      // Update payment status
      payment.status = PaymentStatus.CANCELLED;
      const updatedPayment = await this.paymentRepository.save(payment);

      // Update associated transaction
      const transaction = await this.transactionRepository.findOne({
        where: { paymentId: payment.id, type: TransactionType.PAYMENT },
      });

      if (transaction) {
        transaction.cancel();
        await this.transactionRepository.save(transaction);
      }

      // Log audit trail
      await this.auditService.logPaymentCancelled(updatedPayment);

      this.logger.log(`Payment cancelled successfully: ${paymentId}`);
      return updatedPayment;

    } catch (error) {
      this.logger.error(`Failed to cancel payment ${paymentId}`, error.stack);
      throw error;
    }
  }

  private async handleSuccessfulPayment(payment: Payment): Promise<void> {
    try {
      // Handle wallet deposits
      if (payment.type === PaymentType.WALLET_DEPOSIT) {
        await this.walletService.deposit(
          payment.userId,
          payment.currency,
          payment.amount,
          payment.description || 'Wallet deposit',
        );
      }

      // Send success notification
      await this.notificationService.sendPaymentSuccessNotification(payment.userId, payment);

      // Trigger any business logic (e.g., activate subscription, unlock features)
      // This would be handled by specific handlers based on payment type

    } catch (error) {
      this.logger.error(`Error in post-payment processing for ${payment.id}`, error.stack);
      // Don't throw here as payment is already completed
    }
  }

  private calculateProcessingFee(amount: number, currency: string): number {
    // Stripe standard fee structure (this would be configurable)
    const baseRate = 0.029; // 2.9%
    const fixedFee = currency === 'USD' ? 0.30 : 0.25;
    
    return (amount * baseRate) + fixedFee;
  }

  private mapStripeStatusToPaymentStatus(stripeStatus: string): PaymentStatus {
    switch (stripeStatus) {
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        return PaymentStatus.PENDING;
      case 'processing':
        return PaymentStatus.PROCESSING;
      case 'succeeded':
        return PaymentStatus.COMPLETED;
      case 'payment_failed':
        return PaymentStatus.FAILED;
      case 'canceled':
        return PaymentStatus.CANCELLED;
      default:
        return PaymentStatus.PENDING;
    }
  }

  private mapRefundReason(reason?: string): 'duplicate' | 'fraudulent' | 'requested_by_customer' {
    if (!reason) return 'requested_by_customer';
    
    const lowerReason = reason.toLowerCase();
    if (lowerReason.includes('duplicate')) return 'duplicate';
    if (lowerReason.includes('fraud')) return 'fraudulent';
    
    return 'requested_by_customer';
  }
}