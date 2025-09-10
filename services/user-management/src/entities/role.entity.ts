import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Permission } from './permission.entity';

export enum SystemRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  TRADER = 'trader',
  PREMIUM_USER = 'premium_user',
  BASIC_USER = 'basic_user',
  GUEST = 'guest',
  API_USER = 'api_user',
  COMPLIANCE_OFFICER = 'compliance_officer',
  RISK_MANAGER = 'risk_manager',
  CUSTOMER_SUPPORT = 'customer_support',
  ANALYST = 'analyst',
}

export enum RoleType {
  SYSTEM = 'system',
  CUSTOM = 'custom',
}

@Entity('roles')
@Index(['name'], { unique: true })
@Index(['type'])
@Index(['isActive'])
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  name: string;

  @Column({ nullable: true })
  displayName?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: RoleType,
    default: RoleType.CUSTOM,
  })
  type: RoleType;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @Column({ name: 'hierarchy_level', default: 0 })
  hierarchyLevel: number;

  @Column({ type: 'simple-array', nullable: true })
  metadata?: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @ManyToMany(() => Permission, (permission) => permission.roles, {
    eager: true,
  })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions: Permission[];

  // Virtual properties
  get isSystemRole(): boolean {
    return this.type === RoleType.SYSTEM;
  }

  get permissionNames(): string[] {
    return this.permissions?.map((permission) => permission.name) || [];
  }

  get userCount(): number {
    return this.users?.length || 0;
  }

  // Methods
  hasPermission(permissionName: string): boolean {
    return (
      this.permissions?.some(
        (permission) => permission.name === permissionName,
      ) || false
    );
  }

  hasAnyPermission(permissionNames: string[]): boolean {
    return (
      this.permissions?.some((permission) =>
        permissionNames.includes(permission.name),
      ) || false
    );
  }

  hasAllPermissions(permissionNames: string[]): boolean {
    return permissionNames.every((permissionName) =>
      this.hasPermission(permissionName),
    );
  }

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }

  setAsDefault(): void {
    this.isDefault = true;
  }

  unsetAsDefault(): void {
    this.isDefault = false;
  }

  updateHierarchyLevel(level: number): void {
    this.hierarchyLevel = Math.max(0, level);
  }

  addMetadata(key: string, value: string): void {
    if (!this.metadata) {
      this.metadata = [];
    }
    const entry = `${key}:${value}`;
    if (!this.metadata.includes(entry)) {
      this.metadata.push(entry);
    }
  }

  removeMetadata(key: string): void {
    if (this.metadata) {
      this.metadata = this.metadata.filter(
        (entry) => !entry.startsWith(`${key}:`),
      );
    }
  }

  getMetadataValue(key: string): string | null {
    if (!this.metadata) return null;
    const entry = this.metadata.find((entry) => entry.startsWith(`${key}:`));
    return entry ? entry.split(':')[1] : null;
  }

  canManageRole(targetRole: Role): boolean {
    // Super admin can manage any role
    if (this.name === SystemRole.SUPER_ADMIN) {
      return true;
    }

    // Admin can manage roles below their level
    if (this.name === SystemRole.ADMIN) {
      return (
        targetRole.name !== SystemRole.SUPER_ADMIN &&
        targetRole.name !== SystemRole.ADMIN
      );
    }

    // Other roles cannot manage roles
    return false;
  }

  static createSystemRole(
    name: SystemRole,
    displayName: string,
    description: string,
    hierarchyLevel: number = 0,
  ): Partial<Role> {
    return {
      name,
      displayName,
      description,
      type: RoleType.SYSTEM,
      hierarchyLevel,
      isActive: true,
      permissions: [],
    };
  }

  static getSystemRoleHierarchy(): Record<SystemRole, number> {
    return {
      [SystemRole.SUPER_ADMIN]: 1000,
      [SystemRole.ADMIN]: 900,
      [SystemRole.COMPLIANCE_OFFICER]: 800,
      [SystemRole.RISK_MANAGER]: 750,
      [SystemRole.MODERATOR]: 700,
      [SystemRole.CUSTOMER_SUPPORT]: 600,
      [SystemRole.ANALYST]: 500,
      [SystemRole.API_USER]: 400,
      [SystemRole.TRADER]: 300,
      [SystemRole.PREMIUM_USER]: 200,
      [SystemRole.BASIC_USER]: 100,
      [SystemRole.GUEST]: 0,
    };
  }

  static getDefaultPermissionsForRole(roleName: SystemRole): string[] {
    const rolePermissions: Record<SystemRole, string[]> = {
      [SystemRole.SUPER_ADMIN]: [
        '*', // All permissions
      ],
      [SystemRole.ADMIN]: [
        'user:*',
        'role:*',
        'permission:read',
        'audit:*',
        'system:read',
        'system:write',
        'content:*',
        'trading:*',
        'education:*',
      ],
      [SystemRole.COMPLIANCE_OFFICER]: [
        'user:read',
        'audit:read',
        'audit:write',
        'compliance:*',
        'kyc:*',
        'risk:read',
        'report:*',
      ],
      [SystemRole.RISK_MANAGER]: [
        'user:read',
        'audit:read',
        'risk:*',
        'trading:read',
        'report:read',
        'alert:*',
      ],
      [SystemRole.MODERATOR]: [
        'user:read',
        'user:update',
        'content:read',
        'content:moderate',
        'community:*',
        'signal:read',
      ],
      [SystemRole.CUSTOMER_SUPPORT]: [
        'user:read',
        'user:support',
        'ticket:*',
        'chat:*',
        'help:*',
      ],
      [SystemRole.ANALYST]: [
        'user:read',
        'trading:read',
        'signal:*',
        'analysis:*',
        'report:read',
        'education:read',
      ],
      [SystemRole.API_USER]: [
        'api:read',
        'trading:read',
        'signal:read',
        'market_data:read',
      ],
      [SystemRole.TRADER]: [
        'profile:*',
        'trading:*',
        'signal:read',
        'education:read',
        'portfolio:*',
        'transaction:*',
      ],
      [SystemRole.PREMIUM_USER]: [
        'profile:*',
        'signal:read',
        'signal:premium',
        'education:*',
        'community:read',
        'community:write',
        'portfolio:read',
      ],
      [SystemRole.BASIC_USER]: [
        'profile:read',
        'profile:update',
        'signal:basic',
        'education:basic',
        'community:read',
      ],
      [SystemRole.GUEST]: ['public:read'],
    };

    return rolePermissions[roleName] || [];
  }
}
