import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

interface HealthCheck {
    service: string;
    status: 'healthy' | 'unhealthy';
    timestamp: string;
    uptime: number;
    version: string;
    checks: {
        database?: {
            status: 'healthy' | 'unhealthy';
            responseTime?: number;
            error?: string;
        };
        redis?: {
            status: 'healthy' | 'unhealthy';
            responseTime?: number;
            error?: string;
        };
        external_apis?: {
            stripe?: {
                status: 'healthy' | 'unhealthy';
                responseTime?: number;
                error?: string;
            };
            paypal?: {
                status: 'healthy' | 'unhealthy';
                responseTime?: number;
                error?: string;
            };
        };
    };
}

@Controller()
export class HealthController {
    constructor(
        @InjectConnection() private readonly connection: Connection,
    ) {}

    @Get('health')
    async getHealth(): Promise<HealthCheck> {
        const healthCheck: HealthCheck = {
            service: process.env.SERVICE_NAME || 'payment-service',
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.VERSION || '1.0.0',
            checks: {},
        };

        // Database health check
        try {
            const start = Date.now();
            await this.connection.query('SELECT 1');
            healthCheck.checks.database = {
                status: 'healthy',
                responseTime: Date.now() - start,
            };
        } catch (error) {
            healthCheck.checks.database = {
                status: 'unhealthy',
                error: error.message,
            };
            healthCheck.status = 'unhealthy';
        }

        return healthCheck;
    }

    @Get('health/ready')
    async getReadiness(): Promise<{ status: string; ready: boolean }> {
        try {
            await this.connection.query('SELECT 1');
            return { status: 'ready', ready: true };
        } catch (error) {
            return { status: 'not ready', ready: false };
        }
    }

    @Get('health/live')
    async getLiveness(): Promise<{ status: string; alive: boolean }> {
        return { status: 'alive', alive: true };
    }
}