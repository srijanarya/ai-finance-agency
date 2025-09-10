/**
 * External API Configuration for TREUM ALGOTECH
 * Centralizes all external service configurations
 */

export interface ExternalApiConfig {
  // Payment Gateways
  razorpay: {
    keyId: string;
    keySecret: string;
    webhookSecret: string;
  };
  
  stripe: {
    secretKey: string;
    publishableKey: string;
    webhookSecret: string;
  };
  
  payu: {
    merchantKey: string;
    merchantSalt: string;
  };
  
  // Crypto Exchanges
  binance: {
    apiKey: string;
    secretKey: string;
    sandbox: boolean;
  };
  
  wazirx: {
    apiKey: string;
    secretKey: string;
  };
  
  // Market Data
  alphaVantage: {
    apiKey: string;
  };
  
  // AI Services
  openai: {
    apiKey: string;
    organization?: string;
  };
  
  anthropic: {
    apiKey: string;
  };
  
  // Communication
  twilio: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };
  
  // Cloud Storage
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    s3Bucket: string;
  };
  
  // Monitoring
  sentry: {
    dsn: string;
  };
}

export const getExternalApiConfig = (): ExternalApiConfig => ({
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  },
  
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  
  payu: {
    merchantKey: process.env.PAYU_MERCHANT_KEY || '',
    merchantSalt: process.env.PAYU_MERCHANT_SALT || '',
  },
  
  binance: {
    apiKey: process.env.BINANCE_API_KEY || '',
    secretKey: process.env.BINANCE_SECRET_KEY || '',
    sandbox: process.env.NODE_ENV !== 'production',
  },
  
  wazirx: {
    apiKey: process.env.WAZIRX_API_KEY || '',
    secretKey: process.env.WAZIRX_SECRET_KEY || '',
  },
  
  alphaVantage: {
    apiKey: process.env.ALPHA_VANTAGE_KEY || '',
  },
  
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    organization: process.env.OPENAI_ORGANIZATION,
  },
  
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  },
  
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },
  
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'ap-south-1',
    s3Bucket: process.env.AWS_S3_BUCKET || '',
  },
  
  sentry: {
    dsn: process.env.SENTRY_DSN || '',
  },
});