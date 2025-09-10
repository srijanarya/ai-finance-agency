/**
 * Current User Decorator
 * Extracts the current authenticated user from the request context
 * Simplified version for the trading service
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
  tenantId: string;
  sessionId?: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);