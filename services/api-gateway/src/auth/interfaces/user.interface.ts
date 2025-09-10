export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
  PREMIUM_USER = 'premium_user',
  VIP_USER = 'vip_user',
}

export enum Permission {
  // User permissions
  READ_PROFILE = 'read:profile',
  UPDATE_PROFILE = 'update:profile',
  DELETE_PROFILE = 'delete:profile',
  
  // Trading permissions
  READ_TRADING = 'read:trading',
  EXECUTE_TRADES = 'execute:trades',
  READ_PORTFOLIO = 'read:portfolio',
  MANAGE_PORTFOLIO = 'manage:portfolio',
  
  // Signals permissions
  READ_SIGNALS = 'read:signals',
  READ_PREMIUM_SIGNALS = 'read:premium_signals',
  READ_VIP_SIGNALS = 'read:vip_signals',
  CREATE_SIGNALS = 'create:signals',
  
  // Payment permissions
  MAKE_PAYMENTS = 'make:payments',
  READ_PAYMENT_HISTORY = 'read:payment_history',
  MANAGE_SUBSCRIPTIONS = 'manage:subscriptions',
  
  // Education permissions
  READ_EDUCATION = 'read:education',
  READ_PREMIUM_EDUCATION = 'read:premium_education',
  CREATE_EDUCATION_CONTENT = 'create:education_content',
  
  // Admin permissions
  MANAGE_USERS = 'manage:users',
  VIEW_ANALYTICS = 'view:analytics',
  SYSTEM_ADMIN = 'system:admin',
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  subscriptionTier?: string;
  iat: number;
  exp: number;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  subscriptionTier?: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}