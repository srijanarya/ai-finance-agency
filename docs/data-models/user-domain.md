# User Domain Data Models

## Core Entities

### User
```typescript
interface User {
  id: UUID;
  email: string;
  username: string;
  passwordHash: string;
  emailVerified: boolean;
  phoneNumber?: string;
  phoneVerified?: boolean;
  status: UserStatus;
  createdAt: DateTime;
  updatedAt: DateTime;
  lastLoginAt?: DateTime;
  deletedAt?: DateTime;
}

enum UserStatus {
  PENDING_VERIFICATION = 'pending_verification',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
  DELETED = 'deleted'
}
```

### UserProfile
```typescript
interface UserProfile {
  id: UUID;
  userId: UUID;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  dateOfBirth?: Date;
  country: string;
  language: string;
  timezone: string;
  preferences: UserPreferences;
  metadata: Record<string, any>;
  createdAt: DateTime;
  updatedAt: DateTime;
}

interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  tradingAlerts: boolean;
  riskAlerts: boolean;
  theme: 'light' | 'dark' | 'auto';
  dashboardLayout: Record<string, any>;
}
```

### Role
```typescript
interface Role {
  id: UUID;
  name: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
}

interface Permission {
  id: UUID;
  resource: string;
  action: string;
  scope: 'own' | 'team' | 'all';
  conditions?: Record<string, any>;
}
```

### UserRole
```typescript
interface UserRole {
  id: UUID;
  userId: UUID;
  roleId: UUID;
  grantedBy: UUID;
  grantedAt: DateTime;
  expiresAt?: DateTime;
  metadata?: Record<string, any>;
}
```

### Session
```typescript
interface Session {
  id: UUID;
  userId: UUID;
  token: string;
  refreshToken: string;
  ipAddress: string;
  userAgent: string;
  deviceInfo?: DeviceInfo;
  expiresAt: DateTime;
  lastActivityAt: DateTime;
  createdAt: DateTime;
}

interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  deviceId?: string;
}
```

### AuditLog
```typescript
interface AuditLog {
  id: UUID;
  userId: UUID;
  action: string;
  resource: string;
  resourceId?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
  createdAt: DateTime;
}
```

### KYCVerification
```typescript
interface KYCVerification {
  id: UUID;
  userId: UUID;
  level: KYCLevel;
  status: KYCStatus;
  documentType: string;
  documentNumber: string;
  documentCountry: string;
  documentExpiry?: Date;
  verificationMethod: string;
  verifiedBy?: string;
  verifiedAt?: DateTime;
  rejectionReason?: string;
  metadata: Record<string, any>;
  createdAt: DateTime;
  updatedAt: DateTime;
}

enum KYCLevel {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

enum KYCStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}
```

## Relationships

- User (1) → UserProfile (1)
- User (1) → UserRole (n)
- User (1) → Session (n)
- User (1) → AuditLog (n)
- User (1) → KYCVerification (n)
- Role (1) → UserRole (n)
- Role (1) → Permission (n)

## Indexes

### User Table
- UNIQUE INDEX on email
- UNIQUE INDEX on username
- INDEX on status
- INDEX on createdAt
- INDEX on lastLoginAt

### Session Table
- UNIQUE INDEX on token
- INDEX on userId
- INDEX on expiresAt
- INDEX on lastActivityAt

### AuditLog Table
- INDEX on userId
- INDEX on action
- INDEX on resource
- INDEX on createdAt

## Security Considerations

1. **Password Storage**: Use bcrypt with minimum 12 rounds
2. **Token Generation**: Use cryptographically secure random generation
3. **Session Management**: Implement sliding window expiration
4. **Audit Trail**: Log all sensitive operations
5. **PII Protection**: Encrypt sensitive fields at rest
6. **GDPR Compliance**: Implement right to deletion and data portability