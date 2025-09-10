import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';

export interface TracingContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  correlationId: string;
  startTime: number;
  serviceName: string;
  operationName: string;
}

@Injectable()
export class TracingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TracingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    
    const traceContext = this.createTraceContext(request, context);
    const startTime = Date.now();

    // Add trace headers to response
    response.setHeader('x-trace-id', traceContext.traceId);
    response.setHeader('x-span-id', traceContext.spanId);
    response.setHeader('x-correlation-id', traceContext.correlationId);

    // Store trace context in request for other interceptors/guards
    request['traceContext'] = traceContext;

    this.logger.debug(`[${traceContext.traceId}] Starting ${traceContext.operationName}`, {
      traceId: traceContext.traceId,
      spanId: traceContext.spanId,
      correlationId: traceContext.correlationId,
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
    });

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        this.logger.debug(`[${traceContext.traceId}] Completed ${traceContext.operationName} in ${duration}ms`, {
          traceId: traceContext.traceId,
          spanId: traceContext.spanId,
          correlationId: traceContext.correlationId,
          duration,
          statusCode: response.statusCode,
          responseSize: JSON.stringify(data).length,
        });
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.logger.error(`[${traceContext.traceId}] Failed ${traceContext.operationName} after ${duration}ms`, {
          traceId: traceContext.traceId,
          spanId: traceContext.spanId,
          correlationId: traceContext.correlationId,
          duration,
          error: error.message,
          stack: error.stack,
        });
        throw error;
      })
    );
  }

  private createTraceContext(request: Request, context: ExecutionContext): TracingContext {
    const traceId = (request.headers['x-trace-id'] as string) || uuidv4();
    const spanId = (request.headers['x-span-id'] as string) || uuidv4();
    const parentSpanId = request.headers['x-parent-span-id'] as string;
    const correlationId = (request.headers['x-correlation-id'] as string) || uuidv4();
    
    const handler = context.getHandler();
    const controller = context.getClass();
    const operationName = `${controller.name}.${handler.name}`;

    return {
      traceId,
      spanId,
      parentSpanId,
      correlationId,
      startTime: Date.now(),
      serviceName: process.env.SERVICE_NAME || 'unknown',
      operationName,
    };
  }
}

@Injectable()
export class MicroserviceTracingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(MicroserviceTracingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const rpcContext = context.switchToRpc();
    const data = rpcContext.getData();
    
    // Extract tracing info from message data
    const traceId = data?.traceId || uuidv4();
    const spanId = data?.spanId || uuidv4();
    const parentSpanId = data?.parentSpanId;
    const correlationId = data?.correlationId || uuidv4();
    
    const handler = context.getHandler();
    const controller = context.getClass();
    const operationName = `${controller.name}.${handler.name}`;
    const startTime = Date.now();

    this.logger.debug(`[${traceId}] Starting microservice operation ${operationName}`, {
      traceId,
      spanId,
      parentSpanId,
      correlationId,
      pattern: rpcContext.getContext(),
    });

    return next.handle().pipe(
      tap((result) => {
        const duration = Date.now() - startTime;
        this.logger.debug(`[${traceId}] Completed microservice operation ${operationName} in ${duration}ms`, {
          traceId,
          spanId,
          correlationId,
          duration,
        });
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.logger.error(`[${traceId}] Failed microservice operation ${operationName} after ${duration}ms`, {
          traceId,
          spanId,
          correlationId,
          duration,
          error: error.message,
          stack: error.stack,
        });
        throw error;
      })
    );
  }
}