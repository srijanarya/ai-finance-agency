import { Injectable } from '@nestjs/common';
import { paymentMetrics } from '../middleware/metrics.middleware';

@Injectable()
export class PaymentMetricsService {
    /**
     * Record a successful payment transaction
     */
    recordPaymentSuccess(
        amount: number,
        currency: string = 'USD',
        method: string,
        processingTimeMs: number
    ): void {
        // Increment transaction counter
        paymentMetrics.transactionsTotal.inc({
            status: 'success',
            method,
            currency,
        });

        // Record revenue (convert to USD if needed)
        const usdAmount = this.convertToUSD(amount, currency);
        paymentMetrics.revenueTotal.inc({
            currency,
            method,
        }, usdAmount);

        // Record processing time
        paymentMetrics.processingDuration.observe({
            method,
            status: 'success',
        }, processingTimeMs / 1000);
    }

    /**
     * Record a failed payment transaction
     */
    recordPaymentFailure(
        method: string,
        errorType: string,
        processingTimeMs: number
    ): void {
        // Increment failure counter
        paymentMetrics.failuresTotal.inc({
            method,
            error_type: errorType,
        });

        // Increment transaction counter with failed status
        paymentMetrics.transactionsTotal.inc({
            status: 'failed',
            method,
            currency: 'USD', // default
        });

        // Record processing time
        paymentMetrics.processingDuration.observe({
            method,
            status: 'failed',
        }, processingTimeMs / 1000);
    }

    /**
     * Record subscription creation
     */
    recordSubscriptionCreated(planType: string): void {
        paymentMetrics.subscriptionNew.inc({
            plan_type: planType,
        });

        // Update active subscriptions gauge
        this.updateActiveSubscriptions(planType, 1);
    }

    /**
     * Record subscription cancellation
     */
    recordSubscriptionCancelled(planType: string, reason: string): void {
        paymentMetrics.subscriptionCancellations.inc({
            plan_type: planType,
            reason,
        });

        // Update active subscriptions gauge
        this.updateActiveSubscriptions(planType, -1);
    }

    /**
     * Record subscription upgrade
     */
    recordSubscriptionUpgrade(fromPlan: string, toPlan: string): void {
        paymentMetrics.subscriptionUpgrades.inc({
            from_plan: fromPlan,
            to_plan: toPlan,
        });

        // Update active subscriptions
        this.updateActiveSubscriptions(fromPlan, -1);
        this.updateActiveSubscriptions(toPlan, 1);
    }

    /**
     * Record refund processed
     */
    recordRefund(amount: number, method: string, reason: string): void {
        paymentMetrics.refundsTotal.inc({
            method,
            reason,
        });

        paymentMetrics.refundAmount.inc({
            method,
        }, amount);
    }

    /**
     * Record chargeback
     */
    recordChargeback(method: string, reason: string): void {
        paymentMetrics.chargebacksTotal.inc({
            method,
            reason,
        });
    }

    /**
     * Record webhook received
     */
    recordWebhookReceived(
        provider: string,
        eventType: string,
        processingTimeMs: number
    ): void {
        paymentMetrics.webhooksReceived.inc({
            provider,
            event_type: eventType,
        });

        paymentMetrics.webhookProcessingDuration.observe({
            provider,
            event_type: eventType,
        }, processingTimeMs / 1000);
    }

    /**
     * Update active subscriptions gauge
     */
    private updateActiveSubscriptions(planType: string, delta: number): void {
        // In a real implementation, you would query the database
        // to get the actual count and set the gauge value
        // For now, we'll just increment/decrement
        if (delta > 0) {
            paymentMetrics.activeSubscriptions.inc({ plan_type: planType }, delta);
        } else {
            paymentMetrics.activeSubscriptions.dec({ plan_type: planType }, Math.abs(delta));
        }
    }

    /**
     * Convert currency to USD (placeholder implementation)
     */
    private convertToUSD(amount: number, currency: string): number {
        // In a real implementation, use a currency conversion service
        const exchangeRates = {
            'USD': 1.0,
            'EUR': 1.1,
            'GBP': 1.3,
            'JPY': 0.007,
            'CAD': 0.75,
            'AUD': 0.65,
        };

        return amount * (exchangeRates[currency] || 1.0);
    }

    /**
     * Set active subscriptions count (call this periodically to sync)
     */
    async syncActiveSubscriptions(): Promise<void> {
        try {
            // Query database for actual subscription counts
            // This is a placeholder - implement actual database query
            const subscriptionCounts = {
                'basic': 150,
                'premium': 75,
                'enterprise': 25,
            };

            // Update gauges with actual values
            Object.entries(subscriptionCounts).forEach(([planType, count]) => {
                paymentMetrics.activeSubscriptions.set({ plan_type: planType }, count);
            });
        } catch (error) {
            console.error('Failed to sync subscription metrics:', error);
        }
    }

    /**
     * Get current payment metrics summary
     */
    getMetricsSummary(): Record<string, any> {
        return {
            message: 'Payment metrics are being collected',
            endpoints: {
                all_metrics: '/metrics',
                business_metrics: '/metrics/business',
                revenue_metrics: '/metrics/revenue',
            },
            tracked_metrics: [
                'payment_transactions_total',
                'payment_revenue_total',
                'payment_processing_duration_seconds',
                'payment_active_subscriptions',
                'payment_subscription_new_total',
                'payment_subscription_cancellations_total',
                'payment_failures_total',
                'payment_refunds_total',
                'payment_chargebacks_total',
                'payment_webhooks_received_total',
            ],
        };
    }
}