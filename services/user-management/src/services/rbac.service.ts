import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, QueryRunner } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { User } from '../entities/user.entity';
import { Role, SystemRole, RoleType } from '../entities/role.entity';
import { Permission, PermissionResource, PermissionAction } from '../entities/permission.entity';
import { AuditService } from './audit.service';
import { AuditAction } from '../entities/audit-log.entity';

interface RoleHierarchy {
  roleId: string;
  roleName: string;
  level: number;
  parentRoles: string[];
  childRoles: string[];
  inheritedPermissions: string[];
}

interface PermissionCheck {
  resource: PermissionResource;
  action: PermissionAction;
  context?: Record<string, any>;
  userId?: string;
}

interface RoleAssignmentOptions {
  bypassHierarchy?: boolean;
  temporaryUntil?: Date;
  metadata?: Record<string, any>;
}

interface PermissionEvaluationResult {
  granted: boolean;
  reason: string;
  matchedPermissions: string[];
  inheritedFrom?: string[];
  context?: Record<string, any>;
}

@Injectable()
export class RbacService {
  private readonly logger = new Logger(RbacService.name);
  private roleHierarchyCache: Map<string, RoleHierarchy> = new Map();
  private permissionCache: Map<string, Permission> = new Map();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    private readonly auditLogService: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.initializeCache();
  }

  /**
   * Check if user has permission for a specific resource and action
   */
  async hasPermission(
    userId: string,
    permissionCheck: PermissionCheck,
  ): Promise<PermissionEvaluationResult> {
    const user = await this.getUserWithRoles(userId);
    if (!user) {
      return {
        granted: false,
        reason: 'User not found',
        matchedPermissions: [],
      };
    }

    return this.evaluatePermission(user, permissionCheck);
  }

  /**
   * Check if user has any of the specified permissions
   */
  async hasAnyPermission(
    userId: string,
    permissionChecks: PermissionCheck[],
  ): Promise<PermissionEvaluationResult> {
    const user = await this.getUserWithRoles(userId);
    if (!user) {
      return {
        granted: false,
        reason: 'User not found',
        matchedPermissions: [],
      };
    }

    for (const check of permissionChecks) {
      const result = await this.evaluatePermission(user, check);
      if (result.granted) {
        return result;
      }
    }

    return {
      granted: false,
      reason: 'No matching permissions found',
      matchedPermissions: [],
    };
  }

  /**
   * Check if user has role with hierarchy consideration
   */
  async hasRole(userId: string, roleName: string): Promise<boolean> {
    const user = await this.getUserWithRoles(userId);
    if (!user) return false;

    const userRoleNames = user.roles.map(role => role.name);
    
    // Direct role check
    if (userRoleNames.includes(roleName)) return true;

    // Hierarchy check - if user has a higher role
    const targetRole = await this.roleRepository.findOne({ where: { name: roleName } });
    if (!targetRole) return false;

    for (const userRole of user.roles) {
      if (await this.isHigherOrEqualRole(userRole.name, roleName)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Assign role to user with hierarchy validation
   */
  async assignRole(
    userId: string,
    roleName: string,
    assignedBy: string,
    options: RoleAssignmentOptions = {},
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.getUserWithRoles(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const role = await this.roleRepository.findOne({ where: { name: roleName } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const assignerUser = await this.getUserWithRoles(assignedBy);
    if (!assignerUser) {
      throw new NotFoundException('Assigner user not found');
    }

    // Check if assigner has permission to assign this role
    if (!options.bypassHierarchy) {
      const canAssign = await this.canAssignRole(assignerUser, role);
      if (!canAssign) {
        throw new ForbiddenException('Insufficient privileges to assign this role');
      }
    }

    // Check if user already has this role
    const hasRole = user.roles.some(userRole => userRole.id === role.id);
    if (hasRole) {
      return {
        success: false,
        message: 'User already has this role',
      };
    }

    // Assign the role
    user.roles.push(role);
    await this.userRepository.save(user);

    // Log the role assignment
    await this.auditLogService.log({
      userId: assignedBy,
      action: AuditAction.ROLE_ASSIGNED,
      resource: 'user_role',
      description: `Assigned role ${roleName} to user ${userId}`,
      ipAddress,
      userAgent,
      metadata: {
        targetUserId: userId,
        roleName,
        options,
      },
    });

    // Clear cache and emit event
    this.clearUserCache(userId);
    this.eventEmitter.emit('role.assigned', {
      userId,
      roleName,
      assignedBy,
      timestamp: new Date(),
    });

    return {
      success: true,
      message: 'Role assigned successfully',
    };
  }

  /**
   * Remove role from user
   */
  async revokeRole(
    userId: string,
    roleName: string,
    revokedBy: string,
    reason?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.getUserWithRoles(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const revokerUser = await this.getUserWithRoles(revokedBy);
    if (!revokerUser) {
      throw new NotFoundException('Revoker user not found');
    }

    const roleToRevoke = user.roles.find(role => role.name === roleName);
    if (!roleToRevoke) {
      return {
        success: false,
        message: 'User does not have this role',
      };
    }

    // Check if revoker has permission to revoke this role
    const canRevoke = await this.canRevokeRole(revokerUser, roleToRevoke);
    if (!canRevoke) {
      throw new ForbiddenException('Insufficient privileges to revoke this role');
    }

    // Remove the role
    user.roles = user.roles.filter(role => role.id !== roleToRevoke.id);
    await this.userRepository.save(user);

    // Log the role revocation
    await this.auditLogService.log({
      userId: revokedBy,
      action: AuditAction.ROLE_REMOVED,
      resource: 'user_role',
      description: `Revoked role ${roleName} from user ${userId}`,
      ipAddress,
      userAgent,
      metadata: {
        targetUserId: userId,
        roleName,
        reason,
      },
    });

    // Clear cache and emit event
    this.clearUserCache(userId);
    this.eventEmitter.emit('role.revoked', {
      userId,
      roleName,
      revokedBy,
      reason,
      timestamp: new Date(),
    });

    return {
      success: true,
      message: 'Role revoked successfully',
    };
  }

  /**
   * Get effective permissions for a user (including inherited)
   */
  async getUserEffectivePermissions(userId: string): Promise<string[]> {
    const user = await this.getUserWithRoles(userId);
    if (!user) return [];

    const permissions = new Set<string>();

    for (const role of user.roles) {
      // Get direct role permissions
      if (role.permissions) {
        role.permissions.forEach(permission => {
          permissions.add(permission.name);
        });
      }

      // Get inherited permissions from hierarchy
      const hierarchy = await this.getRoleHierarchy(role.name);
      hierarchy.inheritedPermissions.forEach(permission => {
        permissions.add(permission);
      });
    }

    return Array.from(permissions);
  }

  /**
   * Get user roles with hierarchy information
   */
  async getUserRolesWithHierarchy(userId: string): Promise<{
    directRoles: Role[];
    effectiveRoles: Role[];
    hierarchyInfo: RoleHierarchy[];
  }> {
    const user = await this.getUserWithRoles(userId);
    if (!user) {
      return {
        directRoles: [],
        effectiveRoles: [],
        hierarchyInfo: [],
      };
    }

    const directRoles = user.roles;
    const effectiveRoleNames = new Set<string>();
    const hierarchyInfo: RoleHierarchy[] = [];

    for (const role of directRoles) {
      const hierarchy = await this.getRoleHierarchy(role.name);
      hierarchyInfo.push(hierarchy);
      
      // Add all roles in hierarchy chain
      effectiveRoleNames.add(role.name);
      hierarchy.parentRoles.forEach(parentRole => {
        effectiveRoleNames.add(parentRole);
      });
    }

    const effectiveRoles = await this.roleRepository.find({
      where: { name: In(Array.from(effectiveRoleNames)) },
      relations: ['permissions'],
    });

    return {
      directRoles,
      effectiveRoles,
      hierarchyInfo,
    };
  }

  /**
   * Create a new role
   */
  async createRole(
    roleData: Partial<Role>,
    createdBy: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Role> {
    const creatorUser = await this.getUserWithRoles(createdBy);
    if (!creatorUser) {
      throw new NotFoundException('Creator user not found');
    }

    // Check if creator has permission to create roles
    const canCreateRole = await this.hasPermission(createdBy, {
      resource: PermissionResource.ROLE,
      action: PermissionAction.CREATE,
    });

    if (!canCreateRole.granted) {
      throw new ForbiddenException('Insufficient privileges to create roles');
    }

    // Check if role name already exists
    const existingRole = await this.roleRepository.findOne({
      where: { name: roleData.name },
    });

    if (existingRole) {
      throw new ConflictException('Role name already exists');
    }

    // Create the role
    const role = this.roleRepository.create({
      ...roleData,
      type: roleData.type || RoleType.CUSTOM,
      isActive: true,
    });

    const savedRole = await this.roleRepository.save(role);

    // Log the role creation
    await this.auditLogService.log({
      userId: createdBy,
      action: AuditAction.ROLE_CREATED,
      resource: 'role',
      description: `Created role ${savedRole.name}`,
      ipAddress,
      userAgent,
      metadata: {
        roleId: savedRole.id,
        roleName: savedRole.name,
        roleType: savedRole.type,
      },
    });

    // Clear cache and emit event
    this.clearRoleCache();
    this.eventEmitter.emit('role.created', {
      roleId: savedRole.id,
      roleName: savedRole.name,
      createdBy,
      timestamp: new Date(),
    });

    return savedRole;
  }

  /**
   * Update role permissions
   */
  async updateRolePermissions(
    roleId: string,
    permissionIds: string[],
    updatedBy: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const updaterUser = await this.getUserWithRoles(updatedBy);
    if (!updaterUser) {
      throw new NotFoundException('Updater user not found');
    }

    // Check if updater has permission to modify this role
    const canUpdateRole = await this.canManageRole(updaterUser, role);
    if (!canUpdateRole) {
      throw new ForbiddenException('Insufficient privileges to update this role');
    }

    // Get the new permissions
    const permissions = await this.permissionRepository.find({
      where: { id: In(permissionIds) },
    });

    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('One or more permissions not found');
    }

    const oldPermissions = role.permissions?.map(p => p.name) || [];
    
    // Update role permissions
    role.permissions = permissions;
    const updatedRole = await this.roleRepository.save(role);

    const newPermissions = permissions.map(p => p.name);

    // Log the permission update
    await this.auditLogService.log({
      userId: updatedBy,
      action: AuditAction.ROLE_UPDATED,
      resource: 'role_permissions',
      description: `Updated permissions for role ${role.name}`,
      ipAddress,
      userAgent,
      metadata: {
        roleId,
        roleName: role.name,
        oldPermissions,
        newPermissions,
        addedPermissions: newPermissions.filter(p => !oldPermissions.includes(p)),
        removedPermissions: oldPermissions.filter(p => !newPermissions.includes(p)),
      },
    });

    // Clear cache and emit event
    this.clearRoleCache();
    this.eventEmitter.emit('role.permissions.updated', {
      roleId,
      roleName: role.name,
      oldPermissions,
      newPermissions,
      updatedBy,
      timestamp: new Date(),
    });

    return updatedRole;
  }

  /**
   * Get role hierarchy for a specific role
   */
  async getRoleHierarchy(roleName: string): Promise<RoleHierarchy> {
    const cacheKey = `hierarchy_${roleName}`;
    
    if (this.roleHierarchyCache.has(cacheKey)) {
      return this.roleHierarchyCache.get(cacheKey)!;
    }

    const role = await this.roleRepository.findOne({
      where: { name: roleName },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role ${roleName} not found`);
    }

    const hierarchy = await this.buildRoleHierarchy(role);
    
    // Cache the result
    this.roleHierarchyCache.set(cacheKey, hierarchy);
    setTimeout(() => {
      this.roleHierarchyCache.delete(cacheKey);
    }, this.cacheTimeout);

    return hierarchy;
  }

  // Private helper methods

  private async getUserWithRoles(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'roles.permissions'],
    });
  }

  private async evaluatePermission(
    user: User,
    permissionCheck: PermissionCheck,
  ): Promise<PermissionEvaluationResult> {
    const allPermissions = new Set<string>();
    const matchedPermissions: string[] = [];
    const inheritedFrom: string[] = [];

    for (const role of user.roles) {
      // Check direct permissions
      if (role.permissions) {
        for (const permission of role.permissions) {
          allPermissions.add(permission.name);
          
          // Check if this permission matches the request
          if (this.doesPermissionMatch(permission, permissionCheck)) {
            matchedPermissions.push(permission.name);
            inheritedFrom.push(role.name);
          }
        }
      }

      // Check inherited permissions from hierarchy
      const hierarchy = await this.getRoleHierarchy(role.name);
      hierarchy.inheritedPermissions.forEach(permissionName => {
        allPermissions.add(permissionName);
      });
    }

    // Check for wildcard permissions
    const hasWildcard = allPermissions.has('*') || 
      allPermissions.has(`${permissionCheck.resource}:*`);

    const granted = matchedPermissions.length > 0 || hasWildcard;

    return {
      granted,
      reason: granted 
        ? `Permission granted via: ${matchedPermissions.join(', ')}${hasWildcard ? ' (wildcard)' : ''}`
        : 'No matching permissions found',
      matchedPermissions,
      inheritedFrom,
      context: permissionCheck.context,
    };
  }

  private doesPermissionMatch(
    permission: Permission,
    check: PermissionCheck,
  ): boolean {
    // Check resource match
    if (permission.resource !== check.resource) {
      return false;
    }

    // Check action match (including wildcard)
    if (permission.action !== check.action && permission.action !== PermissionAction.ALL) {
      return false;
    }

    // Additional context-based checks could be added here
    return true;
  }

  private async isHigherOrEqualRole(userRole: string, targetRole: string): Promise<boolean> {
    const roleHierarchy = Role.getSystemRoleHierarchy();
    const userLevel = roleHierarchy[userRole as SystemRole] || 0;
    const targetLevel = roleHierarchy[targetRole as SystemRole] || 0;
    
    return userLevel >= targetLevel;
  }

  private async canAssignRole(assigner: User, role: Role): Promise<boolean> {
    // Super admin can assign any role
    if (assigner.hasRole(SystemRole.SUPER_ADMIN)) {
      return true;
    }

    // Admin can assign roles below their level
    if (assigner.hasRole(SystemRole.ADMIN)) {
      return role.name !== SystemRole.SUPER_ADMIN && role.name !== SystemRole.ADMIN;
    }

    // Check specific permissions
    return assigner.hasPermission('role:assign') || assigner.hasPermission('role:*');
  }

  private async canRevokeRole(revoker: User, role: Role): Promise<boolean> {
    return this.canAssignRole(revoker, role); // Same logic for now
  }

  private async canManageRole(manager: User, role: Role): Promise<boolean> {
    return manager.hasPermission('role:update') || 
           manager.hasPermission('role:*') ||
           manager.hasRole(SystemRole.SUPER_ADMIN);
  }

  private async buildRoleHierarchy(role: Role): Promise<RoleHierarchy> {
    const hierarchy: RoleHierarchy = {
      roleId: role.id,
      roleName: role.name,
      level: role.hierarchyLevel,
      parentRoles: [],
      childRoles: [],
      inheritedPermissions: [],
    };

    // Get parent roles (higher in hierarchy)
    const parentRoles = await this.roleRepository.find({
      where: { hierarchyLevel: role.hierarchyLevel + 1 },
      relations: ['permissions'],
    });

    // Get child roles (lower in hierarchy)
    const childRoles = await this.roleRepository.find({
      where: { hierarchyLevel: role.hierarchyLevel - 1 },
    });

    hierarchy.parentRoles = parentRoles.map(r => r.name);
    hierarchy.childRoles = childRoles.map(r => r.name);

    // Calculate inherited permissions
    const inheritedPermissions = new Set<string>();
    
    for (const parentRole of parentRoles) {
      if (parentRole.permissions) {
        parentRole.permissions.forEach(permission => {
          inheritedPermissions.add(permission.name);
        });
      }
    }

    hierarchy.inheritedPermissions = Array.from(inheritedPermissions);

    return hierarchy;
  }

  private async initializeCache(): Promise<void> {
    // Initialize permission cache
    const permissions = await this.permissionRepository.find();
    permissions.forEach(permission => {
      this.permissionCache.set(permission.name, permission);
    });

    this.logger.log(`Initialized RBAC cache with ${permissions.length} permissions`);
  }

  private clearUserCache(userId: string): void {
    // Clear user-specific cache entries
    const keysToDelete = Array.from(this.roleHierarchyCache.keys())
      .filter(key => key.includes(userId));
    
    keysToDelete.forEach(key => {
      this.roleHierarchyCache.delete(key);
    });
  }

  private clearRoleCache(): void {
    this.roleHierarchyCache.clear();
    this.initializeCache(); // Reinitialize
  }
}