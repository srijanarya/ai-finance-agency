import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsBoolean,
  IsUUID,
  IsEnum,
  IsArray,
  IsInt,
  Min,
  Max,
  ArrayMinSize,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { SystemRole, RoleType } from '../entities/role.entity';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Role name (unique identifier)',
    example: 'custom_analyst',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name: string;

  @ApiPropertyOptional({
    description: 'Human-readable display name',
    example: 'Custom Analyst',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Display name must be a string' })
  @MaxLength(100, { message: 'Display name must not exceed 100 characters' })
  displayName?: string;

  @ApiPropertyOptional({
    description: 'Role description',
    example: 'Custom role for financial analysts with specialized permissions',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Role type',
    enum: RoleType,
    example: RoleType.CUSTOM,
    default: RoleType.CUSTOM,
  })
  @IsOptional()
  @IsEnum(RoleType, { message: 'Type must be a valid role type' })
  type?: RoleType;

  @ApiPropertyOptional({
    description: 'Whether the role is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean value' })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Whether this is the default role for new users',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is default must be a boolean value' })
  isDefault?: boolean;

  @ApiPropertyOptional({
    description: 'Role hierarchy level (higher numbers have more privileges)',
    example: 100,
    minimum: 0,
    maximum: 1000,
    default: 0,
  })
  @IsOptional()
  @IsInt({ message: 'Hierarchy level must be an integer' })
  @Min(0, { message: 'Hierarchy level must be at least 0' })
  @Max(1000, { message: 'Hierarchy level must not exceed 1000' })
  hierarchyLevel?: number;

  @ApiPropertyOptional({
    description: 'Array of permission IDs to assign to this role',
    example: ['permission-uuid-1', 'permission-uuid-2'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Permission IDs must be an array' })
  @IsUUID(4, { each: true, message: 'Each permission ID must be a valid UUID' })
  permissionIds?: string[];

  @ApiPropertyOptional({
    description: 'Role metadata (key-value pairs)',
    example: ['department:finance', 'level:senior'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Metadata must be an array' })
  @IsString({ each: true, message: 'Each metadata item must be a string' })
  metadata?: string[];
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @ApiPropertyOptional({
    description: 'Role ID (cannot be updated)',
  })
  @IsOptional()
  readonly id?: string;

  // Override name to make it optional for updates
  @ApiPropertyOptional({
    description: 'Role name (unique identifier)',
    example: 'custom_analyst',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name?: string;
}

export class AssignPermissionsDto {
  @ApiProperty({
    description: 'Array of permission IDs to assign',
    example: ['permission-uuid-1', 'permission-uuid-2'],
    type: [String],
  })
  @IsArray({ message: 'Permission IDs must be an array' })
  @ArrayMinSize(1, { message: 'At least one permission ID is required' })
  @IsUUID(4, { each: true, message: 'Each permission ID must be a valid UUID' })
  permissionIds: string[];

  @ApiPropertyOptional({
    description: 'Whether to replace existing permissions or add to them',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Replace must be a boolean value' })
  replace?: boolean;

  @ApiPropertyOptional({
    description: 'Reason for permission assignment',
    example: 'Adding analytics permissions for Q4 reporting',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Reason must be a string' })
  @MaxLength(500, { message: 'Reason must not exceed 500 characters' })
  reason?: string;
}

export class RemovePermissionsDto {
  @ApiProperty({
    description: 'Array of permission IDs to remove',
    example: ['permission-uuid-1', 'permission-uuid-2'],
    type: [String],
  })
  @IsArray({ message: 'Permission IDs must be an array' })
  @ArrayMinSize(1, { message: 'At least one permission ID is required' })
  @IsUUID(4, { each: true, message: 'Each permission ID must be a valid UUID' })
  permissionIds: string[];

  @ApiPropertyOptional({
    description: 'Reason for permission removal',
    example: 'Removing deprecated permissions',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Reason must be a string' })
  @MaxLength(500, { message: 'Reason must not exceed 500 characters' })
  reason?: string;
}

export class RoleSearchDto {
  @ApiPropertyOptional({
    description: 'Search query (searches name, display name, description)',
    example: 'analyst',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Query must be a string' })
  @MaxLength(100, { message: 'Query must not exceed 100 characters' })
  query?: string;

  @ApiPropertyOptional({
    description: 'Filter by role type',
    enum: RoleType,
    example: RoleType.CUSTOM,
  })
  @IsOptional()
  @IsEnum(RoleType, { message: 'Type must be a valid role type' })
  type?: RoleType;

  @ApiPropertyOptional({
    description: 'Filter by active status',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean value' })
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by default status',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is default must be a boolean value' })
  isDefault?: boolean;

  @ApiPropertyOptional({
    description: 'Minimum hierarchy level',
    example: 0,
    minimum: 0,
    maximum: 1000,
  })
  @IsOptional()
  @IsInt({ message: 'Minimum hierarchy level must be an integer' })
  @Min(0, { message: 'Minimum hierarchy level must be at least 0' })
  @Max(1000, { message: 'Minimum hierarchy level must not exceed 1000' })
  minHierarchyLevel?: number;

  @ApiPropertyOptional({
    description: 'Maximum hierarchy level',
    example: 1000,
    minimum: 0,
    maximum: 1000,
  })
  @IsOptional()
  @IsInt({ message: 'Maximum hierarchy level must be an integer' })
  @Min(0, { message: 'Maximum hierarchy level must be at least 0' })
  @Max(1000, { message: 'Maximum hierarchy level must not exceed 1000' })
  maxHierarchyLevel?: number;

  @ApiPropertyOptional({
    description: 'Filter by specific permission',
    example: 'trading:read',
  })
  @IsOptional()
  @IsString({ message: 'Permission must be a string' })
  hasPermission?: string;

  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'createdAt',
    enum: ['createdAt', 'updatedAt', 'name', 'displayName', 'hierarchyLevel'],
  })
  @IsOptional()
  @IsString({ message: 'Sort by must be a string' })
  sortBy?:
    | 'createdAt'
    | 'updatedAt'
    | 'name'
    | 'displayName'
    | 'hierarchyLevel';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsString({ message: 'Sort order must be a string' })
  sortOrder?: 'asc' | 'desc';
}

export class SystemRoleDto {
  @ApiProperty({
    description: 'System role to create',
    enum: SystemRole,
    example: SystemRole.PREMIUM_USER,
  })
  @IsEnum(SystemRole, { message: 'System role must be a valid system role' })
  systemRole: SystemRole;

  @ApiPropertyOptional({
    description: 'Whether to override existing system role if it exists',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Override existing must be a boolean value' })
  overrideExisting?: boolean;

  @ApiPropertyOptional({
    description:
      'Custom permissions to add beyond default system role permissions',
    example: ['custom:permission:1', 'custom:permission:2'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Additional permissions must be an array' })
  @IsString({
    each: true,
    message: 'Each additional permission must be a string',
  })
  additionalPermissions?: string[];
}

export class BulkRoleOperationDto {
  @ApiProperty({
    description: 'Array of role IDs to operate on',
    example: ['role-uuid-1', 'role-uuid-2'],
    type: [String],
  })
  @IsArray({ message: 'Role IDs must be an array' })
  @ArrayMinSize(1, { message: 'At least one role ID is required' })
  @IsUUID(4, { each: true, message: 'Each role ID must be a valid UUID' })
  roleIds: string[];

  @ApiProperty({
    description: 'Operation to perform',
    example: 'activate',
    enum: ['activate', 'deactivate', 'delete'],
  })
  @IsString({ message: 'Operation must be a string' })
  @IsEnum(['activate', 'deactivate', 'delete'], {
    message: 'Operation must be one of: activate, deactivate, delete',
  })
  operation: 'activate' | 'deactivate' | 'delete';

  @ApiPropertyOptional({
    description: 'Reason for bulk operation',
    example: 'Quarterly role cleanup',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Reason must be a string' })
  @MaxLength(500, { message: 'Reason must not exceed 500 characters' })
  reason?: string;
}

// Response DTOs
export class RoleResponseDto {
  @ApiProperty({ example: 'uuid-123' })
  id: string;

  @ApiProperty({ example: 'custom_analyst' })
  name: string;

  @ApiProperty({ example: 'Custom Analyst', required: false })
  displayName?: string;

  @ApiProperty({
    example: 'Custom role for financial analysts',
    required: false,
  })
  description?: string;

  @ApiProperty({ enum: RoleType, example: RoleType.CUSTOM })
  type: RoleType;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: false })
  isDefault: boolean;

  @ApiProperty({ example: 100 })
  hierarchyLevel: number;

  @ApiProperty({
    example: ['trading:read', 'signal:read'],
    type: [String],
  })
  permissions: string[];

  @ApiProperty({ example: 25 })
  userCount: number;

  @ApiProperty({
    example: ['department:finance', 'level:senior'],
    type: [String],
    required: false,
  })
  metadata?: string[];

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2023-01-02T00:00:00.000Z' })
  updatedAt: string;
}

export class RoleListResponseDto {
  @ApiProperty({ type: [RoleResponseDto] })
  roles: RoleResponseDto[];

  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

export class RoleStatsDto {
  @ApiProperty({ example: 15 })
  totalRoles: number;

  @ApiProperty({ example: 12 })
  activeRoles: number;

  @ApiProperty({ example: 3 })
  inactiveRoles: number;

  @ApiProperty({ example: 8 })
  systemRoles: number;

  @ApiProperty({ example: 7 })
  customRoles: number;

  @ApiProperty({ example: 1 })
  defaultRoles: number;

  @ApiProperty({ example: 1250 })
  totalRoleAssignments: number;

  @ApiProperty({
    example: {
      basic_user: 800,
      premium_user: 300,
      admin: 5,
    },
  })
  roleDistribution: Record<string, number>;
}

export class PermissionAssignmentResultDto {
  @ApiProperty({ example: 'uuid-123' })
  roleId: string;

  @ApiProperty({ example: ['permission-1', 'permission-2'] })
  assignedPermissions: string[];

  @ApiProperty({ example: ['permission-3'] })
  skippedPermissions: string[];

  @ApiProperty({ example: ['permission-4'] })
  failedPermissions: string[];

  @ApiProperty({ example: 'Permissions assigned successfully' })
  message: string;
}

export class BulkOperationResultDto {
  @ApiProperty({ example: ['role-1', 'role-2'] })
  successfulRoles: string[];

  @ApiProperty({ example: ['role-3'] })
  failedRoles: string[];

  @ApiProperty({ example: 2 })
  successCount: number;

  @ApiProperty({ example: 1 })
  failureCount: number;

  @ApiProperty({ example: 'Bulk operation completed with some failures' })
  message: string;

  @ApiProperty({
    example: { 'role-3': 'Role not found' },
    required: false,
  })
  errors?: Record<string, string>;
}
