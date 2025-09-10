import { applyDecorators, SetMetadata } from '@nestjs/common';

export const CIRCUIT_BREAKER_KEY = 'circuit_breaker';

export interface CircuitBreakerOptions {
  name?: string;
  failureThreshold?: number;
  recoveryTimeout?: number;
  monitoringPeriod?: number;
  expectedErrors?: string[];
  fallback?: string; // Method name to call on failure
}

export const CircuitBreaker = (options: CircuitBreakerOptions = {}) => {
  return applyDecorators(
    SetMetadata(CIRCUIT_BREAKER_KEY, {
      failureThreshold: 5,
      recoveryTimeout: 10000,
      monitoringPeriod: 30000,
      expectedErrors: [],
      ...options,
    })
  );
};

export const RETRY_KEY = 'retry';

export interface RetryOptions {
  retries?: number;
  factor?: number;
  minTimeout?: number;
  maxTimeout?: number;
  randomize?: boolean;
  when?: (error: Error) => boolean;
}

export const Retry = (options: RetryOptions = {}) => {
  return applyDecorators(
    SetMetadata(RETRY_KEY, {
      retries: 3,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 10000,
      randomize: true,
      ...options,
    })
  );
};