/**
 * Common utility functions used across TREUM microservices
 */

import { ApiResponse, PaginatedApiResponse } from '../types';

export function createApiResponse<T>(
  data?: T,
  message?: string,
  success: boolean = true
): ApiResponse<T> {
  return {
    success,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: generateUUID(),
      version: '1.0.0'
    }
  };
}

export function createErrorResponse(
  error: string,
  message?: string
): ApiResponse {
  return {
    success: false,
    error: {
      code: error,
      message: message || 'An error occurred'
    },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: generateUUID(),
      version: '1.0.0'
    }
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedApiResponse<T> {
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: generateUUID(),
      version: '1.0.0'
    }
  };
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}