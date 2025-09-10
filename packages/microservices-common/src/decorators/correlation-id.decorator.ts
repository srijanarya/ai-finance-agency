import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const CorrelationId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    
    // Check if correlation ID exists in headers
    let correlationId = request.headers['x-correlation-id'] as string;
    
    if (!correlationId) {
      // Generate a new correlation ID if none exists
      correlationId = uuidv4();
      request.headers['x-correlation-id'] = correlationId;
    }
    
    return correlationId;
  },
);

export const TraceId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    
    // Check if trace ID exists in headers
    let traceId = request.headers['x-trace-id'] as string;
    
    if (!traceId) {
      // Generate a new trace ID if none exists
      traceId = uuidv4();
      request.headers['x-trace-id'] = traceId;
    }
    
    return traceId;
  },
);

export const SpanId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    
    // Check if span ID exists in headers
    let spanId = request.headers['x-span-id'] as string;
    
    if (!spanId) {
      // Generate a new span ID if none exists
      spanId = uuidv4();
      request.headers['x-span-id'] = spanId;
    }
    
    return spanId;
  },
);