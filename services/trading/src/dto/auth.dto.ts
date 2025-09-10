import { ApiProperty } from '@nestjs/swagger';

/**
 * Current User DTO for authenticated requests
 * Represents the authenticated user data attached to requests
 */
export class CurrentUserDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: 'uuid-123-456-789',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'trader@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User roles',
    example: ['institutional_trader', 'premium_user'],
    type: [String],
  })
  roles: string[];

  @ApiProperty({
    description: 'User permissions',
    example: ['trading:*', 'risk:read'],
    type: [String],
  })
  permissions: string[];

  @ApiProperty({
    description: 'Tenant/Organization identifier',
    example: 'tenant-uuid-123',
  })
  tenantId: string;

  @ApiProperty({
    description: 'Session identifier (optional)',
    example: 'session-uuid-456',
    required: false,
  })
  sessionId?: string;
}