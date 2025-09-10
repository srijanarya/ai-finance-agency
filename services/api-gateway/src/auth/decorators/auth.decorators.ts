import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole, Permission, User } from '../interfaces/user.interface';

// Public route decorator - bypasses authentication
export const Public = () => SetMetadata('isPublic', true);

// Roles decorator - requires specific roles
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);

// Permissions decorator - requires specific permissions
export const RequirePermissions = (...permissions: Permission[]) => 
  SetMetadata('permissions', permissions);

// API Key required decorator
export const RequireApiKey = () => SetMetadata('requiresApiKey', true);

// Current user decorator - extracts user from request
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// Subscription tier decorator
export const RequireSubscription = (...tiers: string[]) => 
  SetMetadata('subscriptionTiers', tiers);