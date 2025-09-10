import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { User, UserStatus } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { AuditAction } from '../entities/audit-log.entity';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateProfileDto,
  UpdatePreferencesDto,
  AssignRoleDto,
  UserSearchDto,
} from '../dto/user.dto';
import { AuditService } from './audit.service';

export interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private auditService: AuditService,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(createUserDto: CreateUserDto, createdById?: string): Promise<User> {
    const { email, roleIds, ...userData } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Get roles if provided
    let roles: Role[] = [];
    if (roleIds && roleIds.length > 0) {
      roles = await this.roleRepository.findBy({ id: In(roleIds) });
      if (roles.length !== roleIds.length) {
        throw new BadRequestException('One or more roles not found');
      }
    }

    // Create user
    const user = this.userRepository.create({
      ...userData,
      email,
      roles,
    });

    const savedUser = await this.userRepository.save(user);

    // Log the creation
    await this.auditService.log({
      userId: createdById,
      action: AuditAction.USER_CREATED,
      resource: 'user',
      resourceId: savedUser.id,
      details: { createdUser: { id: savedUser.id, email: savedUser.email } },
    });

    return this.findById(savedUser.id);
  }

  async update(id: string, updateUserDto: UpdateUserDto, updatedById?: string): Promise<User> {
    const user = await this.findById(id);
    const { email, ...updateData } = updateUserDto;

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
      updateData.email = email;
    }

    // Update user
    await this.userRepository.update(id, updateData);

    // Log the update
    await this.auditService.log({
      userId: updatedById,
      action: AuditAction.USER_UPDATED,
      resource: 'user',
      resourceId: id,
      details: { updates: updateData },
    });

    return this.findById(id);
  }

  async updateProfile(id: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(id);

    await this.userRepository.update(id, updateProfileDto);

    // Log the profile update
    await this.auditService.log({
      userId: id,
      action: AuditAction.PROFILE_UPDATED,
      resource: 'user',
      resourceId: id,
      details: { updates: updateProfileDto },
    });

    return this.findById(id);
  }

  async updatePreferences(id: string, updatePreferencesDto: UpdatePreferencesDto): Promise<User> {
    await this.findById(id); // Ensure user exists

    await this.userRepository.update(id, {
      preferences: updatePreferencesDto.preferences,
    });

    // Log the preferences update
    await this.auditService.log({
      userId: id,
      action: AuditAction.PREFERENCES_UPDATED,
      resource: 'user',
      resourceId: id,
    });

    return this.findById(id);
  }

  async delete(id: string, deletedById?: string): Promise<{ message: string }> {
    const user = await this.findById(id);

    // Soft delete by setting status to inactive
    await this.userRepository.update(id, {
      status: UserStatus.INACTIVE,
    });

    // Log the deletion
    await this.auditService.log({
      userId: deletedById,
      action: AuditAction.USER_DELETED,
      resource: 'user',
      resourceId: id,
      details: { deletedUser: { id: user.id, email: user.email } },
    });

    return { message: 'User deleted successfully' };
  }

  async assignRoles(id: string, assignRoleDto: AssignRoleDto, assignedById?: string): Promise<User> {
    const user = await this.findById(id);
    const { roleIds } = assignRoleDto;

    // Get roles
    const roles = await this.roleRepository.findBy({ id: In(roleIds) });
    if (roles.length !== roleIds.length) {
      throw new BadRequestException('One or more roles not found');
    }

    // Update user roles
    user.roles = roles;
    await this.userRepository.save(user);

    // Log the role assignment
    await this.auditService.log({
      userId: assignedById,
      action: AuditAction.ROLE_ASSIGNED,
      resource: 'user',
      resourceId: id,
      details: { assignedRoles: roles.map(r => ({ id: r.id, name: r.name })) },
    });

    return this.findById(id);
  }

  async removeRole(id: string, roleId: string, removedById?: string): Promise<User> {
    const user = await this.findById(id);
    
    const roleToRemove = user.roles.find(role => role.id === roleId);
    if (!roleToRemove) {
      throw new BadRequestException('User does not have this role');
    }

    // Remove role
    user.roles = user.roles.filter(role => role.id !== roleId);
    await this.userRepository.save(user);

    // Log the role removal
    await this.auditService.log({
      userId: removedById,
      action: AuditAction.ROLE_REMOVED,
      resource: 'user',
      resourceId: id,
      details: { removedRole: { id: roleToRemove.id, name: roleToRemove.name } },
    });

    return this.findById(id);
  }

  async search(searchDto: UserSearchDto): Promise<PaginatedUsers> {
    const {
      search,
      status,
      role,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = '1',
      limit = '10',
    } = searchDto;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const offset = (pageNumber - 1) * limitNumber;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('roles.permissions', 'permissions');

    // Apply search filter
    if (search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply status filter
    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    // Apply role filter
    if (role) {
      queryBuilder.andWhere('roles.name = :role', { role });
    }

    // Apply sorting
    if (sortBy && (sortOrder === 'ASC' || sortOrder === 'DESC')) {
      queryBuilder.orderBy(`user.${sortBy}`, sortOrder);
    }

    // Apply pagination
    queryBuilder.skip(offset).take(limitNumber);

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      users,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    };
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['roles', 'roles.permissions'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    pending: number;
    suspended: number;
  }> {
    const [total, active, inactive, pending, suspended] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { status: UserStatus.ACTIVE } }),
      this.userRepository.count({ where: { status: UserStatus.INACTIVE } }),
      this.userRepository.count({ where: { status: UserStatus.PENDING_VERIFICATION } }),
      this.userRepository.count({ where: { status: UserStatus.SUSPENDED } }),
    ]);

    return { total, active, inactive, pending, suspended };
  }
}