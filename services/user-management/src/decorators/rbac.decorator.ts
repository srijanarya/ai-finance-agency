import { SetMetadata, applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { HierarchicalRolesGuard } from '../guards/hierarchical-roles.guard';
import { SystemRole } from '../entities/role.entity';
import { PermissionResource, PermissionAction } from '../entities/permission.entity';

// Metadata keys
export const RBAC_CONTEXT_KEY = 'rbac:context';
export const RESOURCE_ACCESS_KEY = 'rbac:resource_access';
export const CONDITIONAL_ACCESS_KEY = 'rbac:conditional';
export const OWNERSHIP_CHECK_KEY = 'rbac:ownership';

// Types for advanced RBAC configuration
interface RbacContext {
  requiresKyc?: boolean;
  requires2FA?: boolean;
  recentAuthRequired?: boolean; // Requires authentication within last 30 minutes
  ipWhitelistRequired?: boolean;
  maintenanceBypass?: boolean;
  riskLevelMax?: number; // Maximum allowed risk score
}

interface ResourceAccess {
  resource: PermissionResource;
  action: PermissionAction;
  context?: Record<string, any>;
}

interface ConditionalAccess {
  condition: string; // JavaScript expression that evaluates to boolean
  errorMessage?: string;
}

interface OwnershipCheck {
  paramName: string; // Parameter name that contains the resource ID
  userIdPath?: string; // Path to user ID in the resource (default: 'userId')
  allowAdminOverride?: boolean; // Allow admin users to bypass ownership check
}

/**
 * Enhanced role-based access control decorator
 * Combines authentication, role checking, and advanced security features
 */
export function RequireAuth(...roles: SystemRole[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(JwtAuthGuard, HierarchicalRolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized - Valid JWT token required' }),
    ApiForbiddenResponse({ description: 'Forbidden - Insufficient privileges' }),
  );
}

/**
 * Require specific permissions with hierarchical checking
 */
export function RequirePermissions(...permissions: string[]) {
  return applyDecorators(
    SetMetadata('permissions', permissions),
    UseGuards(JwtAuthGuard, HierarchicalRolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized - Valid JWT token required' }),
    ApiForbiddenResponse({ description: 'Forbidden - Required permissions not found' }),
  );
}

/**
 * Require both roles and permissions
 */
export function RequireRolesAndPermissions(
  roles: SystemRole[],
  permissions: string[],
) {
  return applyDecorators(
    SetMetadata('roles', roles),
    SetMetadata('permissions', permissions),
    UseGuards(JwtAuthGuard, HierarchicalRolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized - Valid JWT token required' }),
    ApiForbiddenResponse({ description: 'Forbidden - Insufficient roles or permissions' }),
  );
}

/**
 * Set RBAC context for additional security checks
 */
export function RbacContext(context: RbacContext) {
  return SetMetadata(RBAC_CONTEXT_KEY, context);
}

/**
 * Require specific resource access
 */
export function RequireResourceAccess(access: ResourceAccess) {
  return SetMetadata(RESOURCE_ACCESS_KEY, access);
}

/**
 * Add conditional access based on custom logic
 */
export function ConditionalAccess(condition: ConditionalAccess) {
  return SetMetadata(CONDITIONAL_ACCESS_KEY, condition);
}

/**
 * Check resource ownership
 */
export function CheckOwnership(ownership: OwnershipCheck) {
  return SetMetadata(OWNERSHIP_CHECK_KEY, ownership);
}

/**
 * Admin-only access (Super Admin or Admin roles)
 */
export function AdminOnly() {
  return RequireAuth(SystemRole.SUPER_ADMIN, SystemRole.ADMIN);
}

/**
 * Super Admin only access
 */
export function SuperAdminOnly() {
  return RequireAuth(SystemRole.SUPER_ADMIN);
}

/**
 * Trading access (requires KYC and appropriate roles)
 */
export function TradingAccess() {
  return applyDecorators(
    RequireAuth(
      SystemRole.TRADER,
      SystemRole.PREMIUM_USER,
      SystemRole.ADMIN,
      SystemRole.SUPER_ADMIN,
    ),
    RbacContext({ requiresKyc: true }),
  );
}

/**
 * Premium features access
 */
export function PremiumAccess() {
  return RequireAuth(
    SystemRole.PREMIUM_USER,
    SystemRole.TRADER,
    SystemRole.ADMIN,
    SystemRole.SUPER_ADMIN,
  );
}

/**
 * Compliance access (for compliance officers and admins)
 */
export function ComplianceAccess() {
  return RequireAuth(
    SystemRole.COMPLIANCE_OFFICER,
    SystemRole.ADMIN,
    SystemRole.SUPER_ADMIN,
  );
}

/**
 * Risk management access
 */
export function RiskManagementAccess() {
  return RequireAuth(
    SystemRole.RISK_MANAGER,
    SystemRole.COMPLIANCE_OFFICER,
    SystemRole.ADMIN,
    SystemRole.SUPER_ADMIN,
  );
}

/**
 * Customer support access
 */
export function SupportAccess() {
  return RequireAuth(
    SystemRole.CUSTOMER_SUPPORT,
    SystemRole.MODERATOR,
    SystemRole.ADMIN,
    SystemRole.SUPER_ADMIN,
  );
}

/**
 * Analyst access (for market analysts)
 */
export function AnalystAccess() {
  return RequireAuth(
    SystemRole.ANALYST,
    SystemRole.ADMIN,
    SystemRole.SUPER_ADMIN,
  );
}

/**
 * API user access (for API clients)
 */
export function ApiAccess() {
  return RequireAuth(
    SystemRole.API_USER,
    SystemRole.TRADER,
    SystemRole.PREMIUM_USER,
    SystemRole.ADMIN,
    SystemRole.SUPER_ADMIN,
  );
}

/**
 * Secure financial operations (requires 2FA and recent auth)
 */
export function SecureFinancialAccess() {
  return applyDecorators(
    RequireAuth(
      SystemRole.TRADER,
      SystemRole.PREMIUM_USER,
      SystemRole.ADMIN,
      SystemRole.SUPER_ADMIN,
    ),
    RbacContext({
      requiresKyc: true,
      requires2FA: true,
      recentAuthRequired: true,
    }),
  );
}

/**
 * Profile access - users can access their own profile, admins can access any
 */
export function ProfileAccess() {
  return applyDecorators(
    RequireAuth(
      SystemRole.BASIC_USER,
      SystemRole.PREMIUM_USER,
      SystemRole.TRADER,
      SystemRole.ADMIN,
      SystemRole.SUPER_ADMIN,
    ),
    CheckOwnership({
      paramName: 'userId',
      allowAdminOverride: true,
    }),
  );
}

/**
 * User management access with ownership checking
 */
export function UserManagementAccess() {
  return applyDecorators(
    RequirePermissions('user:read', 'user:update'),
    CheckOwnership({
      paramName: 'userId',
      allowAdminOverride: true,
    }),
  );
}

/**
 * Session management access
 */
export function SessionAccess() {
  return applyDecorators(
    RequireAuth(
      SystemRole.BASIC_USER,
      SystemRole.PREMIUM_USER,
      SystemRole.TRADER,
      SystemRole.ADMIN,
      SystemRole.SUPER_ADMIN,
    ),
    CheckOwnership({
      paramName: 'userId',
      allowAdminOverride: true,
    }),
  );
}

/**
 * Role management access (admin operations)
 */
export function RoleManagementAccess() {
  return applyDecorators(
    RequirePermissions('role:create', 'role:update', 'role:delete'),
    RbacContext({ requires2FA: true }),
  );
}

/**
 * Permission management access (super admin only)
 */
export function PermissionManagementAccess() {
  return applyDecorators(
    SuperAdminOnly(),
    RequirePermissions('permission:create', 'permission:update', 'permission:delete'),
    RbacContext({ requires2FA: true }),
  );
}

/**
 * System configuration access
 */
export function SystemConfigAccess() {
  return applyDecorators(
    SuperAdminOnly(),
    RequirePermissions('system:configure'),
    RbacContext({
      requires2FA: true,
      recentAuthRequired: true,
    }),
  );
}

/**
 * Audit log access
 */
export function AuditAccess() {
  return RequireAuth(
    SystemRole.COMPLIANCE_OFFICER,
    SystemRole.ADMIN,
    SystemRole.SUPER_ADMIN,
  );
}

/**
 * Public access (no authentication required)
 */
export function PublicAccess() {
  return applyDecorators(
    // No guards applied - endpoint is public
  );
}

/**
 * Guest access (basic authentication but minimal privileges)
 */
export function GuestAccess() {
  return RequireAuth(SystemRole.GUEST, SystemRole.BASIC_USER);
}

/**
 * Development/Debug access (only in development environment)
 */
export function DevAccess() {
  return applyDecorators(
    ConditionalAccess({
      condition: 'process.env.NODE_ENV === "development"',
      errorMessage: 'Development endpoints not available in production',
    }),
    SuperAdminOnly(),
  );
}