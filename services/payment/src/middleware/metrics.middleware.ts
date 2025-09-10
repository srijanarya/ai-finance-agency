import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as promClient from 'prom-client';

// Create a Registry to register the metrics
const register = new promClient.Registry();

// Add default metrics
promClient.collectDefaultMetrics({
    register,
    prefix: 'nodejs_',
});

// HTTP Metrics
const httpRequestsTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
    registers: [register],
});

const httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.1, 0.5, 1, 2, 5, 10],
    registers: [register],
});

const activeConnections = new promClient.Gauge({
    name: 'active_connections',
    help: 'Number of active connections',
    registers: [register],
});

// Payment Business Metrics
export const paymentMetrics = {
    // Transaction metrics
    transactionsTotal: new promClient.Counter({
        name: 'payment_transactions_total',
        help: 'Total payment transactions',
        labelNames: ['status', 'method', 'currency'],
        registers: [register],
    }),

    // Revenue metrics
    revenueTotal: new promClient.Counter({
        name: 'payment_revenue_total',
        help: 'Total payment revenue in USD',
        labelNames: ['currency', 'method'],
        registers: [register],
    }),

    // Processing time
    processingDuration: new promClient.Histogram({
        name: 'payment_processing_duration_seconds',
        help: 'Payment processing duration in seconds',
        labelNames: ['method', 'status'],
        buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
        registers: [register],
    }),

    // Subscription metrics
    activeSubscriptions: new promClient.Gauge({
        name: 'payment_active_subscriptions',
        help: 'Number of active subscriptions',
        labelNames: ['plan_type'],
        registers: [register],
    }),

    subscriptionNew: new promClient.Counter({
        name: 'payment_subscription_new_total',
        help: 'Total new subscriptions',
        labelNames: ['plan_type'],
        registers: [register],
    }),

    subscriptionCancellations: new promClient.Counter({
        name: 'payment_subscription_cancellations_total',
        help: 'Total subscription cancellations',
        labelNames: ['plan_type', 'reason'],
        registers: [register],
    }),

    subscriptionUpgrades: new promClient.Counter({
        name: 'payment_subscription_upgrades_total',
        help: 'Total subscription upgrades',
        labelNames: ['from_plan', 'to_plan'],
        registers: [register],
    }),

    // Failure metrics
    failuresTotal: new promClient.Counter({
        name: 'payment_failures_total',
        help: 'Total payment failures',
        labelNames: ['method', 'error_type'],
        registers: [register],
    }),

    // Refund metrics
    refundsTotal: new promClient.Counter({
        name: 'payment_refunds_total',
        help: 'Total refunds processed',
        labelNames: ['method', 'reason'],
        registers: [register],
    }),

    refundAmount: new promClient.Counter({
        name: 'payment_refund_amount_total',
        help: 'Total refund amount in USD',
        labelNames: ['method'],
        registers: [register],
    }),

    // Chargeback metrics
    chargebacksTotal: new promClient.Counter({
        name: 'payment_chargebacks_total',
        help: 'Total chargebacks',
        labelNames: ['method', 'reason'],
        registers: [register],
    }),

    // Webhook metrics
    webhooksReceived: new promClient.Counter({
        name: 'payment_webhooks_received_total',
        help: 'Total webhooks received',
        labelNames: ['provider', 'event_type'],
        registers: [register],
    }),

    webhookProcessingDuration: new promClient.Histogram({
        name: 'payment_webhook_processing_duration_seconds',
        help: 'Webhook processing duration in seconds',
        labelNames: ['provider', 'event_type'],
        buckets: [0.1, 0.5, 1, 2, 5],
        registers: [register],
    }),
};

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const start = Date.now();
        
        // Track active connections
        activeConnections.inc();
        
        res.on('finish', () => {
            const duration = (Date.now() - start) / 1000;
            const route = req.route ? req.route.path : req.url;
            
            // Record HTTP metrics
            httpRequestsTotal.inc({
                method: req.method,
                route: route,
                status: res.statusCode.toString(),
            });
            
            httpRequestDuration.observe({
                method: req.method,
                route: route,
                status: res.statusCode.toString(),
            }, duration);
            
            // Decrease active connections
            activeConnections.dec();
        });
        
        next();
    }
}

// Metrics endpoint function
export const getMetrics = async (): Promise<string> => {
    return await register.metrics();
};

export { register };