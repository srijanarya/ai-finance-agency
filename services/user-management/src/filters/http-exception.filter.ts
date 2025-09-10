import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { ValidationError } from 'class-validator';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = null;
    let stack: string | undefined;

    // Handle different exception types
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
        errors = (exceptionResponse as any).errors || null;

        // Handle validation errors from class-validator
        if (
          exception instanceof BadRequestException &&
          (exceptionResponse as any).message
        ) {
          const validationMessages = (exceptionResponse as any).message;
          if (Array.isArray(validationMessages)) {
            errors = this.formatValidationErrors(validationMessages);
            message = 'Validation failed';
          }
        }
      } else {
        message = exceptionResponse as string;
      }

      stack = exception.stack;
    } else if (exception instanceof QueryFailedError) {
      // Handle database errors
      status = HttpStatus.BAD_REQUEST;
      message = this.handleDatabaseError(exception);
      stack = exception.stack;
    } else if (exception instanceof Error) {
      message = exception.message;
      stack = exception.stack;
    }

    // Log the error
    const errorDetails = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      errors,
      // Include stack trace only in development
      ...(process.env.NODE_ENV !== 'production' && { stack }),
      // Include request details for debugging
      requestId: (request as any).id,
      userId: (request as any).user?.id,
      ip: request.ip,
      userAgent: request.get('user-agent'),
    };

    // Log based on severity
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${message}`,
        stack,
        'HttpException',
      );
    } else if (status >= 400) {
      this.logger.warn(
        `${request.method} ${request.url} - ${status} - ${message}`,
        'HttpException',
      );
    }

    // Send response
    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      errors,
      timestamp: errorDetails.timestamp,
      path: errorDetails.path,
      requestId: errorDetails.requestId,
      // Include stack trace only in development
      ...(process.env.NODE_ENV !== 'production' && {
        stack: errorDetails.stack,
      }),
    });
  }

  private formatValidationErrors(errors: ValidationError[] | string[]): any {
    if (typeof errors[0] === 'string') {
      return errors;
    }

    const validationErrors = errors as ValidationError[];
    const formattedErrors: any = {};

    validationErrors.forEach((error) => {
      const property = error.property;
      formattedErrors[property] = Object.values(error.constraints || {});
    });

    return formattedErrors;
  }

  private handleDatabaseError(error: QueryFailedError): string {
    const message = error.message.toLowerCase();

    // Handle common database constraints
    if (message.includes('duplicate') || message.includes('unique')) {
      if (message.includes('email')) {
        return 'Email already exists';
      }
      if (message.includes('username')) {
        return 'Username already exists';
      }
      return 'Duplicate entry found';
    }

    if (message.includes('foreign key')) {
      return 'Related resource not found';
    }

    if (message.includes('not null')) {
      return 'Required field is missing';
    }

    // Log the full error for debugging
    this.logger.error('Database error', error.stack, 'DatabaseError');

    // Return generic message in production
    return process.env.NODE_ENV === 'production'
      ? 'Database operation failed'
      : error.message;
  }
}
