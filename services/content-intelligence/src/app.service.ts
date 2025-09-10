import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly startTime = Date.now();

  getServiceInfo(): {
    service: string;
    version: string;
    status: string;
    description: string;
    features: string[];
  } {
    return {
      service: 'Content Intelligence Engine',
      version: '1.0.0',
      status: 'active',
      description: 'AI-Powered Content Intelligence Engine & Multi-Platform Publishing Service for TREUM Finance Platform',
      features: [
        'AI Content Generation',
        'Multi-Platform Publishing',
        'Compliance Validation',
        'Quality Assessment',
        'Content Personalization',
        'Analytics & Insights',
        'Template Management',
        'Approval Workflows',
      ],
    };
  }

  getHealth(): {
    status: string;
    timestamp: string;
    uptime: number;
  } {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
    };
  }
}