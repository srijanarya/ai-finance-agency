// Utility Types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export interface PaginatedApiResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Error Types
export interface ServiceError {
  code: string;
  message: string;
  service: string;
  timestamp: Date;
  correlationId?: string;
  stack?: string;
  context?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
  value: any;
  constraints: string[];
}

// Configuration Types
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  maxConnections?: number;
  timeout?: number;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  database?: number;
  keyPrefix?: string;
  ttl?: number;
}

export interface RabbitMQConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  vhost: string;
  exchange?: string;
  queues?: Record<string, QueueConfig>;
}

export interface QueueConfig {
  name: string;
  durable: boolean;
  exclusive: boolean;
  autoDelete: boolean;
  arguments?: Record<string, any>;
}

export interface ServiceConfig {
  name: string;
  version: string;
  port: number;
  environment: 'development' | 'staging' | 'production';
  database: DatabaseConfig;
  redis?: RedisConfig;
  rabbitmq?: RabbitMQConfig;
  jwt?: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  cors?: {
    origin: string | string[];
    credentials: boolean;
  };
  logging?: {
    level: 'error' | 'warn' | 'info' | 'debug';
    format: 'json' | 'text';
  };
}

// Authentication & Authorization Types
export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface JwtPayload {
  sub: string; // user ID
  email: string;
  username: string;
  role: string;
  tier: string;
  iat: number;
  exp: number;
  correlationId?: string;
}

export interface AuthContext {
  user: {
    id: string;
    email: string;
    username: string;
    role: string;
    tier: string;
  };
  token: string;
  correlationId: string;
}

// Circuit Breaker Types
export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  monitor: boolean;
  fallback?: () => any;
  onStateChange?: (state: CircuitState) => void;
  onFailure?: (error: Error) => void;
}

// Retry Types
export interface RetryOptions {
  retries: number;
  factor: number;
  minTimeout: number;
  maxTimeout: number;
  randomize: boolean;
  forever?: boolean;
  unref?: boolean;
  maxRetryTime?: number;
}

// Message Queue Types
export interface QueueMessage<T = any> {
  id: string;
  pattern: string;
  data: T;
  timestamp: Date;
  attempts: number;
  maxAttempts: number;
  delay?: number;
  priority?: number;
  correlationId?: string;
}

export interface MessageHandler<T = any> {
  (data: T, context?: MessageContext): Promise<any>;
}

export interface MessageContext {
  pattern: string;
  correlationId: string;
  timestamp: Date;
  replyTo?: string;
  headers?: Record<string, any>;
}

// gRPC Types
export interface GrpcOptions {
  host: string;
  port: number;
  package: string;
  protoPath: string;
  maxSendMessageLength?: number;
  maxReceiveMessageLength?: number;
  keepalive?: {
    keepaliveTimeMs: number;
    keepaliveTimeoutMs: number;
    keepalivePermitWithoutCalls: boolean;
    http2MaxPingsWithoutData: number;
    http2MinTimeBetweenPingsMs: number;
    http2MinPingIntervalWithoutDataMs: number;
  };
}

export interface GrpcMetadata {
  [key: string]: string | Buffer | string[] | Buffer[];
}

export interface GrpcCall {
  metadata: GrpcMetadata;
  deadline: Date;
  cancelled: boolean;
  getPeer(): string;
}

// Health Check Types
export interface HealthIndicator {
  key: string;
  check(): Promise<HealthCheckResult>;
}

export interface HealthCheckResult {
  status: 'up' | 'down';
  message?: string;
  data?: Record<string, any>;
  responseTime?: number;
}

export interface HealthCheckOptions {
  timeout?: number;
  retries?: number;
  gracefulShutdown?: boolean;
}

// Monitoring Types
export interface MetricData {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

export interface TraceSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  tags: Record<string, any>;
  logs: Array<{
    timestamp: number;
    fields: Record<string, any>;
  }>;
  status: {
    code: number;
    message?: string;
  };
}

// File Upload Types
export interface FileUploadOptions {
  maxSize: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  destination: string;
  filename?: (file: any) => string;
}

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
  filename?: string;
  path?: string;
}

// Search Types
export interface SearchOptions {
  query: string;
  fields?: string[];
  filters?: Record<string, any>;
  sort?: Array<{
    field: string;
    order: 'asc' | 'desc';
  }>;
  page?: number;
  limit?: number;
  highlight?: boolean;
  fuzzy?: boolean;
}

export interface SearchResult<T = any> {
  items: Array<{
    item: T;
    score: number;
    highlight?: Record<string, string[]>;
  }>;
  total: number;
  page: number;
  limit: number;
  query: string;
  took: number;
}

// Webhook Types
export interface WebhookPayload {
  event: string;
  timestamp: Date;
  data: any;
  signature?: string;
  deliveryId: string;
}

export interface WebhookConfig {
  url: string;
  secret: string;
  events: string[];
  active: boolean;
  maxRetries: number;
  timeout: number;
}

// Background Job Types
export interface JobOptions {
  delay?: number;
  attempts?: number;
  backoff?: {
    type: 'fixed' | 'exponential';
    delay: number;
  };
  lifo?: boolean;
  priority?: number;
  removeOnComplete?: number;
  removeOnFail?: number;
  jobId?: string;
}

export interface JobProgress {
  progress: number;
  data?: any;
}

export interface Job<T = any> {
  id: string;
  data: T;
  opts: JobOptions;
  progress(progress: number, data?: any): Promise<void>;
  log(row: string): Promise<number>;
  moveToCompleted(returnValue?: any): Promise<void>;
  moveToFailed(errorInfo: any): Promise<void>;
  retry(): Promise<void>;
}

// Feature Flag Types
export interface FeatureFlag {
  key: string;
  enabled: boolean;
  rollout: number; // 0-100 percentage
  conditions?: {
    userIds?: string[];
    userTiers?: string[];
    environments?: string[];
  };
}

export interface FeatureFlagContext {
  userId?: string;
  userTier?: string;
  environment: string;
  customAttributes?: Record<string, any>;
}

// Rate Limiting Types
export interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  statusCode?: number;
  headers?: boolean;
  skip?: (req: any) => boolean;
  keyGenerator?: (req: any) => string;
  onLimitReached?: (req: any, res: any) => void;
}

export interface RateLimitInfo {
  limit: number;
  current: number;
  remaining: number;
  resetTime: Date;
}