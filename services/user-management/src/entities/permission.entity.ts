import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  Index,
} from 'typeorm';
import { Role } from './role.entity';

export enum PermissionType {
  SYSTEM = 'system',
  BUSINESS = 'business',
  FEATURE = 'feature',
  DATA = 'data',
}

export enum PermissionScope {
  GLOBAL = 'global',
  ORGANIZATION = 'organization',
  DEPARTMENT = 'department',
  PERSONAL = 'personal',
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXECUTE = 'execute',
  APPROVE = 'approve',
  REJECT = 'reject',
  MODERATE = 'moderate',
  ADMIN = 'admin',
  ALL = '*',
}

export enum PermissionResource {
  // User Management
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',

  // Authentication & Security
  AUTH = 'auth',
  SESSION = 'session',
  AUDIT = 'audit',

  // KYC & Compliance
  KYC = 'kyc',
  COMPLIANCE = 'compliance',
  RISK = 'risk',

  // Trading & Finance
  TRADING = 'trading',
  PORTFOLIO = 'portfolio',
  TRANSACTION = 'transaction',
  MARKET_DATA = 'market_data',
  SIGNAL = 'signal',

  // Content & Education
  CONTENT = 'content',
  EDUCATION = 'education',
  COURSE = 'course',
  ARTICLE = 'article',

  // Community & Social
  COMMUNITY = 'community',
  CHAT = 'chat',
  FORUM = 'forum',
  COMMENT = 'comment',

  // Analytics & Reporting
  ANALYTICS = 'analytics',
  REPORT = 'report',
  DASHBOARD = 'dashboard',

  // System & Admin
  SYSTEM = 'system',
  CONFIGURATION = 'configuration',
  LOGS = 'logs',
  BACKUP = 'backup',

  // API & Integration
  API = 'api',
  WEBHOOK = 'webhook',
  INTEGRATION = 'integration',

  // Support & Help
  TICKET = 'ticket',
  HELP = 'help',
  FAQ = 'faq',

  // Billing & Subscription
  BILLING = 'billing',
  SUBSCRIPTION = 'subscription',
  PAYMENT = 'payment',

  // Public & General
  PUBLIC = 'public',
  PROFILE = 'profile',
  NOTIFICATION = 'notification',
  ALERT = 'alert',
}

@Entity('permissions')
@Index(['name'], { unique: true })
@Index(['resource'])
@Index(['action'])
@Index(['type'])
@Index(['isActive'])
export class Permission {
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
    enum: PermissionResource,
  })
  resource: PermissionResource;

  @Column({
    type: 'enum',
    enum: PermissionAction,
  })
  action: PermissionAction;

  @Column({
    type: 'enum',
    enum: PermissionType,
    default: PermissionType.FEATURE,
  })
  type: PermissionType;

  @Column({
    type: 'enum',
    enum: PermissionScope,
    default: PermissionScope.GLOBAL,
  })
  scope: PermissionScope;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_system', default: false })
  isSystem: boolean;

  @Column({ name: 'hierarchy_level', default: 0 })
  hierarchyLevel: number;

  @Column({ type: 'simple-array', nullable: true })
  dependencies?: string[];

  @Column({ type: 'simple-array', nullable: true })
  conditions?: string[];

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  // Virtual properties
  get fullName(): string {
    return `${this.resource}:${this.action}`;
  }

  get isWildcard(): boolean {
    return this.action === PermissionAction.ALL;
  }

  get roleCount(): number {
    return this.roles?.length || 0;
  }

  // Methods
  matches(resource: PermissionResource, action: PermissionAction): boolean {
    if (this.resource !== resource) {
      return false;
    }

    return this.action === PermissionAction.ALL || this.action === action;
  }

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }

  addDependency(permissionName: string): void {
    if (!this.dependencies) {
      this.dependencies = [];
    }
    if (!this.dependencies.includes(permissionName)) {
      this.dependencies.push(permissionName);
    }
  }

  removeDependency(permissionName: string): void {
    if (this.dependencies) {
      this.dependencies = this.dependencies.filter(
        (dep) => dep !== permissionName,
      );
    }
  }

  addCondition(condition: string): void {
    if (!this.conditions) {
      this.conditions = [];
    }
    if (!this.conditions.includes(condition)) {
      this.conditions.push(condition);
    }
  }

  removeCondition(condition: string): void {
    if (this.conditions) {
      this.conditions = this.conditions.filter((cond) => cond !== condition);
    }
  }

  setMetadata(key: string, value: any): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    this.metadata[key] = value;
  }

  getMetadata(key: string): any {
    return this.metadata?.[key] || null;
  }

  removeMetadata(key: string): void {
    if (this.metadata) {
      delete this.metadata[key];
    }
  }

  static createPermission(
    resource: PermissionResource,
    action: PermissionAction,
    options: Partial<{
      displayName: string;
      description: string;
      type: PermissionType;
      scope: PermissionScope;
      hierarchyLevel: number;
      isSystem: boolean;
    }> = {},
  ): Partial<Permission> {
    const name = `${resource}:${action}`;
    const displayName =
      options.displayName || `${action} ${resource}`.replace('_', ' ');

    return {
      name,
      displayName,
      description: options.description,
      resource,
      action,
      type: options.type || PermissionType.FEATURE,
      scope: options.scope || PermissionScope.GLOBAL,
      hierarchyLevel: options.hierarchyLevel || 0,
      isSystem: options.isSystem || false,
      isActive: true,
    };
  }

  static getSystemPermissions(): Partial<Permission>[] {
    const permissions: Partial<Permission>[] = [];

    // Generate basic CRUD permissions for each resource
    Object.values(PermissionResource).forEach((resource) => {
      // Basic CRUD operations
      [
        PermissionAction.CREATE,
        PermissionAction.READ,
        PermissionAction.UPDATE,
        PermissionAction.DELETE,
      ].forEach((action) => {
        permissions.push(
          this.createPermission(resource, action, {
            type: PermissionType.SYSTEM,
            isSystem: true,
          }),
        );
      });

      // Wildcard permission for full access
      permissions.push(
        this.createPermission(resource, PermissionAction.ALL, {
          type: PermissionType.SYSTEM,
          isSystem: true,
          displayName: `All ${resource} permissions`,
          description: `Full access to all ${resource} operations`,
        }),
      );
    });

    // Add special permissions
    const specialPermissions = [
      // Authentication & Security
      {
        resource: PermissionResource.AUTH,
        action: 'login' as PermissionAction,
      },
      {
        resource: PermissionResource.AUTH,
        action: 'logout' as PermissionAction,
      },
      {
        resource: PermissionResource.AUTH,
        action: 'refresh' as PermissionAction,
      },
      {
        resource: PermissionResource.SESSION,
        action: 'manage' as PermissionAction,
      },

      // User Management
      {
        resource: PermissionResource.USER,
        action: 'support' as PermissionAction,
      },
      {
        resource: PermissionResource.USER,
        action: 'impersonate' as PermissionAction,
      },
      {
        resource: PermissionResource.ROLE,
        action: 'assign' as PermissionAction,
      },

      // Trading & Signals
      {
        resource: PermissionResource.SIGNAL,
        action: 'basic' as PermissionAction,
      },
      {
        resource: PermissionResource.SIGNAL,
        action: 'premium' as PermissionAction,
      },
      {
        resource: PermissionResource.TRADING,
        action: 'execute' as PermissionAction,
      },

      // Content & Education
      {
        resource: PermissionResource.CONTENT,
        action: PermissionAction.MODERATE,
      },
      {
        resource: PermissionResource.EDUCATION,
        action: 'basic' as PermissionAction,
      },
      {
        resource: PermissionResource.COURSE,
        action: 'enroll' as PermissionAction,
      },

      // System Administration
      {
        resource: PermissionResource.SYSTEM,
        action: 'configure' as PermissionAction,
      },
      { resource: PermissionResource.BACKUP, action: PermissionAction.EXECUTE },
      { resource: PermissionResource.LOGS, action: 'view' as PermissionAction },
    ];

    specialPermissions.forEach(({ resource, action }) => {
      permissions.push(
        this.createPermission(resource, action, {
          type: PermissionType.SYSTEM,
          isSystem: true,
        }),
      );
    });

    return permissions;
  }

  static parsePermissionString(permissionString: string): {
    resource: string;
    action: string;
  } | null {
    const parts = permissionString.split(':');
    if (parts.length === 2) {
      return {
        resource: parts[0],
        action: parts[1],
      };
    }
    return null;
  }

  static isValidPermissionString(permissionString: string): boolean {
    const parsed = this.parsePermissionString(permissionString);
    if (!parsed) return false;

    const isValidResource = Object.values(PermissionResource).includes(
      parsed.resource as PermissionResource,
    );
    const isValidAction = Object.values(PermissionAction).includes(
      parsed.action as PermissionAction,
    );

    return isValidResource && isValidAction;
  }
}
