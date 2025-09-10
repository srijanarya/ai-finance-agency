import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { getMetrics } from '../middleware/metrics.middleware';

@Controller()
export class MetricsController {
    @Get('metrics')
    async getMetrics(@Res() res: Response): Promise<void> {
        try {
            const metrics = await getMetrics();
            res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
            res.send(metrics);
        } catch (error) {
            res.status(500).send(`Error generating metrics: ${error.message}`);
        }
    }

    @Get('metrics/business')
    async getBusinessMetrics(@Res() res: Response): Promise<void> {
        try {
            const metrics = await getMetrics();
            // Filter only business-specific metrics
            const businessMetricsLines = metrics
                .split('\n')
                .filter(line => 
                    line.includes('payment_') || 
                    line.includes('# HELP payment_') || 
                    line.includes('# TYPE payment_')
                );
            
            res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
            res.send(businessMetricsLines.join('\n'));
        } catch (error) {
            res.status(500).send(`Error generating business metrics: ${error.message}`);
        }
    }

    @Get('metrics/revenue')
    async getRevenueMetrics(@Res() res: Response): Promise<void> {
        try {
            const metrics = await getMetrics();
            // Filter only revenue-specific metrics
            const revenueMetricsLines = metrics
                .split('\n')
                .filter(line => 
                    line.includes('payment_revenue_') || 
                    line.includes('payment_subscription_') ||
                    line.includes('# HELP payment_revenue_') || 
                    line.includes('# TYPE payment_revenue_') ||
                    line.includes('# HELP payment_subscription_') || 
                    line.includes('# TYPE payment_subscription_')
                );
            
            res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
            res.send(revenueMetricsLines.join('\n'));
        } catch (error) {
            res.status(500).send(`Error generating revenue metrics: ${error.message}`);
        }
    }
}