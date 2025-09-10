import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getServiceInfo() {
    return {
      name: 'AI Finance Agency - Notification Service',
      version: process.env.npm_package_version || '1.0.0',
      description: 'Real-time notification service supporting email, SMS, push notifications, and WebSocket connections',
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3006,
      timestamp: new Date().toISOString(),
      features: [
        'Email notifications via SMTP/Nodemailer',
        'SMS notifications via Twilio',
        'Push notifications via Web Push API',
        'Real-time WebSocket notifications',
        'In-app notification system',
        'Notification preferences management',
        'Template-based notifications',
        'Bulk notification sending',
        'Notification history and analytics',
        'User quiet hours support',
        'Multi-channel delivery'
      ],
      endpoints: {
        health: '/api/health',
        docs: '/api/docs',
        notifications: '/api/notifications',
        preferences: '/api/notification-preferences',
        websocket: '/notifications'
      }
    };
  }
}
