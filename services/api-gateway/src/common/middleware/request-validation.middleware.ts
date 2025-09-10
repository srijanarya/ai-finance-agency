import { Injectable, NestMiddleware, BadRequestException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestValidationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestValidationMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // Add request ID for tracking
    req.headers['x-request-id'] = req.headers['x-request-id'] || uuidv4();
    
    // Add request timestamp
    (req as any).startTime = Date.now();
    
    // Validate content-type for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const contentType = req.headers['content-type'];
      if (contentType && !contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
        throw new BadRequestException('Content-Type must be application/json or multipart/form-data');
      }
    }

    // Sanitize query parameters
    this.sanitizeQuery(req);
    
    // Validate request size
    this.validateRequestSize(req);
    
    next();
  }

  private sanitizeQuery(req: Request) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        // Remove potentially dangerous characters
        req.query[key] = (req.query[key] as string)
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
    }
  }

  private validateRequestSize(req: Request) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);
    
    if (contentLength > maxSize) {
      throw new BadRequestException('Request entity too large');
    }
  }
}

// Common validation rules
export const CommonValidation = {
  // ID validation
  id: param('id').isUUID().withMessage('Invalid ID format'),
  
  // Pagination validation
  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('sort').optional().isString().isLength({ max: 50 }).withMessage('Sort field is invalid'),
    query('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
  ],

  // Email validation
  email: body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  
  // Password validation
  password: body('password')
    .isLength({ min: 8, max: 128 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be 8-128 characters with uppercase, lowercase, number and special character'),

  // Amount validation for financial operations
  amount: body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number with at least 0.01'),

  // Currency validation
  currency: body('currency')
    .isIn(['USD', 'EUR', 'GBP', 'BTC', 'ETH'])
    .withMessage('Invalid currency'),

  // Trading pair validation
  tradingPair: body('pair')
    .matches(/^[A-Z]{3,5}\/[A-Z]{3,5}$/)
    .withMessage('Trading pair must be in format like BTC/USD'),

  // Date range validation
  dateRange: [
    query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO8601 date'),
    query('endDate').optional().isISO8601().withMessage('End date must be valid ISO8601 date'),
  ],
};

// Validation result handler
export function handleValidationErrors(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(error => ({
      field: (error as any).param || (error as any).path || 'unknown',
      value: (error as any).value,
      message: (error as any).msg || error.msg,
      location: (error as any).location || 'body',
    }));

    throw new BadRequestException({
      message: 'Validation failed',
      errors: errorDetails,
    });
  }
  
  next();
}