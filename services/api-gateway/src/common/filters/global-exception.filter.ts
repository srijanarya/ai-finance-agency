import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';
import { MonitoringService } from '../../monitoring/monitoring.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private monitoringService?: MonitoringService) {}

  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = request.headers['x-request-id'] as string;

    const status = this.getHttpStatus(exception);
    const errorResponse = this.buildErrorResponse(exception, request, requestId, status);

    // Log the error
    this.logError(exception, request, requestId, status);

    // Record metrics if monitoring service is available
    if (this.monitoringService) {
      this.monitoringService.recordHttpRequest(
        request.method,
        request.route?.path || request.path,
        status,
        Date.now() - ((request as any).startTime || Date.now())
      );
    }

    response.status(status).json(errorResponse);
  }

  private getHttpStatus(exception: any): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    // Map common errors to HTTP status codes
    if (exception.name === 'ValidationError') {
      return HttpStatus.BAD_REQUEST;
    }

    if (exception.name === 'UnauthorizedError' || exception.name === 'JsonWebTokenError') {
      return HttpStatus.UNAUTHORIZED;
    }

    if (exception.name === 'ForbiddenError') {
      return HttpStatus.FORBIDDEN;
    }

    if (exception.name === 'NotFoundError') {
      return HttpStatus.NOT_FOUND;
    }

    if (exception.name === 'ConflictError') {
      return HttpStatus.CONFLICT;
    }

    if (exception.code === 'ECONNREFUSED' || exception.code === 'ECONNRESET') {
      return HttpStatus.BAD_GATEWAY;
    }

    if (exception.code === 'ETIMEDOUT') {
      return HttpStatus.GATEWAY_TIMEOUT;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private buildErrorResponse(
    exception: any,
    request: Request,
    requestId: string,
    status: number
  ): ApiResponse {
    const baseResponse: ApiResponse = {
      success: false,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: requestId || 'unknown',
        version: 'v1',
      },
    };

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      
      baseResponse.error = {
        code: this.getErrorCode(status),
        message: this.getErrorMessage(exceptionResponse),
        details: this.getErrorDetails(exceptionResponse),
      };
    } else {
      baseResponse.error = {
        code: this.getErrorCode(status),
        message: this.getGenericErrorMessage(status),
        details: this.isDevelopment() ? {
          name: exception.name,
          message: exception.message,
          stack: exception.stack,
        } : undefined,
      };
    }

    return baseResponse;
  }

  private getErrorCode(status: number): string {
    const errorCodes: { [key: number]: string } = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      405: 'METHOD_NOT_ALLOWED',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
      504: 'GATEWAY_TIMEOUT',
    };

    return errorCodes[status] || 'UNKNOWN_ERROR';
  }

  private getErrorMessage(exceptionResponse: any): string {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (exceptionResponse?.message) {
      if (Array.isArray(exceptionResponse.message)) {
        return exceptionResponse.message.join(', ');
      }
      return exceptionResponse.message;
    }

    return 'An error occurred';
  }

  private getErrorDetails(exceptionResponse: any): any {
    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const { message, ...details } = exceptionResponse;
      return Object.keys(details).length > 0 ? details : undefined;
    }

    return undefined;
  }

  private getGenericErrorMessage(status: number): string {
    const messages: { [key: number]: string } = {
      400: 'Bad Request - The request could not be understood',
      401: 'Unauthorized - Authentication is required',
      403: 'Forbidden - You do not have permission to access this resource',
      404: 'Not Found - The requested resource could not be found',
      405: 'Method Not Allowed - The HTTP method is not supported',
      409: 'Conflict - The request conflicts with the current state',
      422: 'Unprocessable Entity - The request is well-formed but contains semantic errors',
      429: 'Too Many Requests - Rate limit exceeded',
      500: 'Internal Server Error - An unexpected error occurred',
      502: 'Bad Gateway - Invalid response from upstream server',
      503: 'Service Unavailable - Service is temporarily unavailable',
      504: 'Gateway Timeout - Upstream server did not respond in time',
    };

    return messages[status] || 'An unexpected error occurred';
  }

  private logError(exception: any, request: Request, requestId: string, status: number): void {
    const errorInfo = {
      requestId,
      method: request.method,
      url: request.originalUrl,
      userAgent: request.get('User-Agent'),
      ip: request.ip,
      status,
      error: {
        name: exception.name,
        message: exception.message,
        stack: exception.stack,
      },
    };

    if (status >= 500) {
      this.logger.error('Internal Server Error', errorInfo);
      
      // Log to monitoring service for alerting
      if (this.monitoringService) {
        this.monitoringService.logError(exception, {
          requestId,
          method: request.method,
          url: request.originalUrl,
          ip: request.ip,
        });
      }
    } else if (status >= 400) {
      this.logger.warn('Client Error', errorInfo);
    } else {
      this.logger.log('Request processed with non-success status', errorInfo);
    }
  }

  private isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }
}