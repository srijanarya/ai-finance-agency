import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseTransformMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ResponseTransformMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // Store the original json method
    const originalJson = res.json;
    const startTime = (req as any).startTime || Date.now();

    // Override the json method to transform responses
    const self = this;
    res.json = function(body: any): Response {
      const requestId = req.headers['x-request-id'] as string;
      const responseTime = Date.now() - startTime;
      
      // Add response time header
      res.setHeader('X-Response-Time', `${responseTime}ms`);
      
      // Transform the response
      const transformedResponse = self.transformResponse(body, req, res, requestId, responseTime);
      
      // Call the original json method with transformed response
      return originalJson.call(res, transformedResponse);
    };

    next();
  }

  private transformResponse(
    data: any, 
    req: Request, 
    res: Response, 
    requestId: string, 
    responseTime: number
  ): ApiResponse {
    const statusCode = res.statusCode;
    const isError = statusCode >= 400;
    
    // Base response structure
    const response: ApiResponse = {
      success: !isError,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId,
        version: 'v1',
      },
    };

    // Add response time to metadata
    (response.metadata as any).responseTime = `${responseTime}ms`;

    // Handle error responses
    if (isError) {
      response.error = {
        code: this.getErrorCode(statusCode),
        message: data?.message || this.getDefaultErrorMessage(statusCode),
        details: data?.details || data?.error || null,
      };
      
      // Log error responses
      this.logger.error(`Error ${statusCode} for ${req.method} ${req.originalUrl}:`, {
        requestId,
        error: response.error,
        responseTime,
      });
    } else {
      // Handle success responses
      response.data = data;
      
      // Add pagination if present
      if (data?.pagination) {
        response.metadata.pagination = data.pagination;
        response.data = data.data || data.items || data;
      }
      
      // Add success message for certain operations
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        response.message = this.getSuccessMessage(req.method, req.path);
      }
    }

    // Add rate limit info if present in headers
    const rateLimitInfo = this.extractRateLimitInfo(res);
    if (rateLimitInfo) {
      response.metadata.rateLimit = rateLimitInfo;
    }

    return response;
  }

  private getErrorCode(statusCode: number): string {
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
    
    return errorCodes[statusCode] || 'UNKNOWN_ERROR';
  }

  private getDefaultErrorMessage(statusCode: number): string {
    const errorMessages: { [key: number]: string } = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      405: 'Method Not Allowed',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
      504: 'Gateway Timeout',
    };
    
    return errorMessages[statusCode] || 'Unknown Error';
  }

  private getSuccessMessage(method: string, path: string): string {
    const pathSegments = path.split('/').filter(Boolean);
    const resource = pathSegments[pathSegments.length - 1] || 'resource';
    
    const messages: { [key: string]: string } = {
      POST: `${resource} created successfully`,
      PUT: `${resource} updated successfully`,
      PATCH: `${resource} updated successfully`,
      DELETE: `${resource} deleted successfully`,
    };
    
    return messages[method] || 'Operation completed successfully';
  }

  private extractRateLimitInfo(res: Response) {
    const limit = res.getHeader('X-RateLimit-Limit');
    const remaining = res.getHeader('X-RateLimit-Remaining');
    const resetTime = res.getHeader('X-RateLimit-Reset');
    
    if (limit && remaining && resetTime) {
      return {
        limit: parseInt(limit as string, 10),
        remaining: parseInt(remaining as string, 10),
        resetTime: resetTime as string,
      };
    }
    
    return null;
  }
}