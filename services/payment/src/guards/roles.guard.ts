import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      // No roles required, allow access
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logger.warn('No user found in request for role check');
      throw new ForbiddenException('User information not available');
    }

    // Extract roles from user payload
    const userRoles = user.roles || [];
    
    // Check if user has any of the required roles
    const hasRole = requiredRoles.some((role) => 
      userRoles.includes(role) || userRoles.includes('admin')
    );

    if (!hasRole) {
      this.logger.warn(
        `User ${user.sub} lacks required roles. Required: [${requiredRoles.join(', ')}], User has: [${userRoles.join(', ')}]`
      );
      throw new ForbiddenException('Insufficient permissions');
    }

    this.logger.debug(
      `Role check passed for user ${user.sub}. Required: [${requiredRoles.join(', ')}], User has: [${userRoles.join(', ')}]`
    );
    return true;
  }
}