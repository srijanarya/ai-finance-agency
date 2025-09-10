import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Roles decorator for method and class-level role-based access control
 * @param roles - Array of role names that are allowed to access the resource
 * @example @Roles('admin', 'moderator', 'institutional_trader')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);