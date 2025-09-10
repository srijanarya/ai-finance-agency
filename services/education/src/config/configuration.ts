export default () => ({
  port: parseInt(process.env.PORT, 10) || 3003,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'education_db',
    synchronize: process.env.DB_SYNC === 'true',
    logging: process.env.DB_LOGGING === 'true',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expirationTime: process.env.JWT_EXPIRATION || '24h',
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024, // 10MB
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,mp4,mp3,jpg,jpeg,png').split(','),
    uploadPath: process.env.UPLOAD_PATH || './uploads',
  },

  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET,
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
  },

  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },

  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
    limit: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  swagger: {
    title: 'Education Service API',
    description: 'API for managing educational content, courses, and user progress',
    version: '1.0',
    path: 'api/docs',
  },

  certificates: {
    baseUrl: process.env.CERTIFICATE_BASE_URL || 'https://certificates.aifinanceacademy.com',
    templatePath: process.env.CERTIFICATE_TEMPLATE_PATH || './templates/certificates',
    organizationName: process.env.ORGANIZATION_NAME || 'AI Finance Academy',
    organizationLogo: process.env.ORGANIZATION_LOGO,
  },

  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    from: process.env.EMAIL_FROM || 'noreply@aifinanceacademy.com',
  },

  microservices: {
    userManagement: {
      url: process.env.USER_MANAGEMENT_URL || 'http://localhost:3001',
      timeout: parseInt(process.env.USER_MANAGEMENT_TIMEOUT, 10) || 5000,
    },
    apiGateway: {
      url: process.env.API_GATEWAY_URL || 'http://localhost:3000',
      timeout: parseInt(process.env.API_GATEWAY_TIMEOUT, 10) || 5000,
    },
  },

  cache: {
    ttl: parseInt(process.env.CACHE_TTL, 10) || 300, // 5 minutes
    max: parseInt(process.env.CACHE_MAX, 10) || 100,
  },

  monitoring: {
    enableMetrics: process.env.ENABLE_METRICS === 'true',
    metricsPath: process.env.METRICS_PATH || '/metrics',
    healthPath: process.env.HEALTH_PATH || '/health',
  },

  security: {
    helmet: {
      contentSecurityPolicy: process.env.NODE_ENV === 'production',
    },
    throttle: {
      ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
      limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 10,
    },
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    file: process.env.LOG_FILE,
  },

  features: {
    enableCertificates: process.env.ENABLE_CERTIFICATES !== 'false',
    enableAssessments: process.env.ENABLE_ASSESSMENTS !== 'false',
    enableProgress: process.env.ENABLE_PROGRESS !== 'false',
    enableUploads: process.env.ENABLE_UPLOADS !== 'false',
    enableNotifications: process.env.ENABLE_NOTIFICATIONS !== 'false',
  },
});