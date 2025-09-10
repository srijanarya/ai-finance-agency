import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { SystemRole } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { RbacService } from '../services/rbac.service';
import { PermissionResource, PermissionAction } from '../entities/permission.entity';

interface AuthenticatedRequest extends Request {
  user: User;
}

interface GuardContext {
  user: User;
  requiredRoles?: SystemRole[];
  requiredPermissions?: string[];
  method: string;
  url: string;
  params: any;
  query: any;
  body: any;
}

@Injectable()
export class HierarchicalRolesGuard implements CanActivate {
  private readonly logger = new Logger(HierarchicalRolesGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      this.logger.warn('No user found in request context');
      throw new ForbiddenException('Authentication required');
    }

    const guardContext: GuardContext = {
      user,
      method: request.method,
      url: request.url,
      params: request.params,
      query: request.query,
      body: request.body,
    };

    // Get required roles and permissions from decorators
    const requiredRoles = this.reflector.getAllAndOverride<SystemRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    guardContext.requiredRoles = requiredRoles;
    guardContext.requiredPermissions = requiredPermissions;

    // If no roles or permissions required, allow access
    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    try {
      // Check roles first (with hierarchy)
      if (requiredRoles && requiredRoles.length > 0) {
        const hasRole = await this.checkRolesWithHierarchy(guardContext);
        if (!hasRole) {
          this.logAccessDenied(guardContext, 'Insufficient role privileges');
          throw new ForbiddenException('Insufficient role privileges');
        }
      }

      // Check permissions (with inheritance)
      if (requiredPermissions && requiredPermissions.length > 0) {
        const hasPermission = await this.checkPermissionsWithInheritance(guardContext);
        if (!hasPermission) {
          this.logAccessDenied(guardContext, 'Insufficient permissions');
          throw new ForbiddenException('Insufficient permissions');
        }
      }

      // Additional context-based checks
      const contextChecks = await this.performContextualChecks(guardContext);
      if (!contextChecks.allowed) {
        this.logAccessDenied(guardContext, contextChecks.reason);
        throw new ForbiddenException(contextChecks.reason);
      }

      this.logAccessGranted(guardContext);
      return true;
    } catch (error) {
      this.logger.error(`Authorization failed for user ${user.id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check roles with hierarchical inheritance
   */
  private async checkRolesWithHierarchy(context: GuardContext): Promise<boolean> {
    const { user, requiredRoles } = context;

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Check each required role
    for (const requiredRole of requiredRoles) {
      const hasRole = await this.rbacService.hasRole(user.id, requiredRole);
      if (hasRole) {
        this.logger.debug(`User ${user.id} has required role: ${requiredRole}`);
        return true;
      }
    }

    // Check if user has a higher-level role that supersedes the required roles
    if (await this.hasSupersedingRole(user, requiredRoles)) {
      return true;
    }

    return false;
  }

  /**
   * Check permissions with role inheritance
   */
  private async checkPermissionsWithInheritance(context: GuardContext): Promise<boolean> {
    const { user, requiredPermissions } = context;

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Get user's effective permissions (including inherited)
    const userPermissions = await this.rbacService.getUserEffectivePermissions(user.id);

    // Check if user has all required permissions
    for (const requiredPermission of requiredPermissions) {
      if (!this.hasEffectivePermission(userPermissions, requiredPermission)) {
        this.logger.debug(`User ${user.id} missing permission: ${requiredPermission}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Perform additional contextual checks
   */
  private async performContextualChecks(context: GuardContext): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    const { user, method, url, params } = context;

    // Check if user is trying to access their own resources
    if (params.userId && params.userId !== user.id) {
      // Allow if user has admin privileges
      const isAdmin = await this.rbacService.hasRole(user.id, SystemRole.ADMIN) ||
                     await this.rbacService.hasRole(user.id, SystemRole.SUPER_ADMIN);
      
      if (!isAdmin) {
        // Check if user has specific permission to access other users' data
        const hasPermission = await this.rbacService.hasPermission(user.id, {
          resource: PermissionResource.USER,
          action: this.getActionFromMethod(method),
          context: { targetUserId: params.userId },
        });

        if (!hasPermission.granted) {
          return {
            allowed: false,
            reason: 'Cannot access other users\' resources',
          };
        }
      }
    }

    // Check resource-specific access controls
    const resourceCheck = await this.checkResourceAccess(context);
    if (!resourceCheck.allowed) {
      return resourceCheck;
    }

    // Check time-based restrictions
    const timeCheck = await this.checkTimeRestrictions(context);
    if (!timeCheck.allowed) {
      return timeCheck;
    }

    // Check IP-based restrictions
    const ipCheck = await this.checkIpRestrictions(context);
    if (!ipCheck.allowed) {
      return ipCheck;
    }

    return { allowed: true };
  }

  /**
   * Check if user has a role that supersedes the required roles
   */
  private async hasSupersedingRole(user: User, requiredRoles: SystemRole[]): Promise<boolean> {
    const userRoleHierarchy = await this.rbacService.getUserRolesWithHierarchy(user.id);
    
    // Super admin supersedes everything
    if (userRoleHierarchy.effectiveRoles.some(role => role.name === SystemRole.SUPER_ADMIN)) {
      return true;
    }

    // Admin supersedes most roles (except super admin)
    if (userRoleHierarchy.effectiveRoles.some(role => role.name === SystemRole.ADMIN)) {
      const hasNonAdminRole = requiredRoles.some(role => 
        role !== SystemRole.SUPER_ADMIN && role !== SystemRole.ADMIN
      );
      return hasNonAdminRole;
    }

    return false;
  }

  /**
   * Check if user has effective permission (including wildcards)
   */
  private hasEffectivePermission(userPermissions: string[], requiredPermission: string): boolean {
    // Direct permission match
    if (userPermissions.includes(requiredPermission)) {
      return true;
    }

    // Check for wildcard permissions
    if (userPermissions.includes('*')) {
      return true;
    }

    // Check for resource-level wildcard
    const [resource] = requiredPermission.split(':');
    if (userPermissions.includes(`${resource}:*`)) {
      return true;
    }

    return false;
  }

  /**
   * Check resource-specific access controls
   */
  private async checkResourceAccess(context: GuardContext): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    const { user, url } = context;

    // Example: Trading endpoints require KYC completion
    if (url.includes('/trading') || url.includes('/portfolio')) {
      if (!user.isKycCompleted) {
        return {
          allowed: false,
          reason: 'KYC verification required for trading operations',
        };
      }
    }

    // Example: Admin endpoints require 2FA
    if (url.includes('/admin')) {
      if (!user.isTwoFactorEnabled) {
        return {
          allowed: false,
          reason: 'Two-factor authentication required for admin operations',
        };
      }
    }

    // Example: Financial operations require recent authentication
    if (url.includes('/payment') || url.includes('/withdrawal')) {
      const recentAuthRequired = 30 * 60 * 1000; // 30 minutes
      const lastLogin = user.lastLoginAt?.getTime() || 0;
      const now = Date.now();

      if (now - lastLogin > recentAuthRequired) {
        return {
          allowed: false,
          reason: 'Recent authentication required for financial operations',
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Check time-based restrictions
   */
  private async checkTimeRestrictions(context: GuardContext): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    // Example: Restrict trading during maintenance hours
    const now = new Date();
    const hour = now.getUTCHours();

    // Maintenance window: 2-4 AM UTC
    if (hour >= 2 && hour < 4 && context.url.includes('/trading')) {
      return {
        allowed: false,
        reason: 'Trading is temporarily unavailable during maintenance window',
      };
    }

    return { allowed: true };
  }

  /**
   * Check IP-based restrictions
   */
  private async checkIpRestrictions(context: GuardContext): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    // This could check against IP whitelists/blacklists
    // For now, always allow
    return { allowed: true };
  }

  /**
   * Get permission action from HTTP method
   */
  private getActionFromMethod(method: string): PermissionAction {
    switch (method.toUpperCase()) {
      case 'GET':
        return PermissionAction.READ;
      case 'POST':
        return PermissionAction.CREATE;
      case 'PUT':
      case 'PATCH':
        return PermissionAction.UPDATE;
      case 'DELETE':
        return PermissionAction.DELETE;
      default:
        return PermissionAction.READ;
    }
  }

  /**
   * Log access granted
   */
  private logAccessGranted(context: GuardContext): void {
    this.logger.debug(`Access granted for user ${context.user.id} to ${context.method} ${context.url}`);
  }

  /**
   * Log access denied
   */
  private logAccessDenied(context: GuardContext, reason: string): void {
    this.logger.warn(
      `Access denied for user ${context.user.id} to ${context.method} ${context.url}: ${reason}`,
      {
        userId: context.user.id,
        method: context.method,
        url: context.url,
        reason,
        requiredRoles: context.requiredRoles,
        requiredPermissions: context.requiredPermissions,
      },
    );
  }
}