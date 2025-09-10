import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role, RoleType } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { AuditAction } from '../entities/audit-log.entity';
import {
  CreateRoleDto,
  UpdateRoleDto,
  AssignPermissionsDto,
} from '../dto/role.dto';
import { AuditService } from './audit.service';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    private auditService: AuditService,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: ['permissions', 'users'],
      order: { hierarchyLevel: 'DESC', createdAt: 'ASC' },
    });
  }

  async findById(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions', 'users'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async findByName(name: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async create(
    createRoleDto: CreateRoleDto,
    createdById?: string,
  ): Promise<Role> {
    const { name, permissionIds, ...roleData } = createRoleDto;

    // Check if role already exists
    const existingRole = await this.roleRepository.findOne({ where: { name } });
    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    // Get permissions if provided
    let permissions: Permission[] = [];
    if (permissionIds && permissionIds.length > 0) {
      permissions = await this.permissionRepository.findBy({
        id: In(permissionIds),
      });
      if (permissions.length !== permissionIds.length) {
        throw new BadRequestException('One or more permissions not found');
      }
    }

    // Create role
    const role = this.roleRepository.create({
      ...roleData,
      name,
      permissions,
    });

    const savedRole = await this.roleRepository.save(role);

    // Log the creation
    await this.auditService.log({
      userId: createdById,
      action: AuditAction.ROLE_ASSIGNED, // Using closest available action
      resource: 'role',
      resourceId: savedRole.id,
      details: { createdRole: { id: savedRole.id, name: savedRole.name } },
    });

    return this.findById(savedRole.id);
  }

  async update(
    id: string,
    updateRoleDto: UpdateRoleDto,
    updatedById?: string,
  ): Promise<Role> {
    const role = await this.findById(id);

    // Check if role name is being changed and if it's already taken
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: updateRoleDto.name },
      });
      if (existingRole) {
        throw new ConflictException('Role with this name already exists');
      }
    }

    // Update role
    await this.roleRepository.update(id, updateRoleDto);

    // Log the update
    await this.auditService.log({
      userId: updatedById,
      action: AuditAction.ROLE_ASSIGNED, // Using closest available action
      resource: 'role',
      resourceId: id,
      details: { updates: updateRoleDto },
    });

    return this.findById(id);
  }

  async delete(id: string, deletedById?: string): Promise<{ message: string }> {
    const role = await this.findById(id);

    // Prevent deletion of system roles
    if (role.isSystemRole) {
      throw new BadRequestException('Cannot delete system roles');
    }

    // Check if role has users assigned
    if (role.users && role.users.length > 0) {
      throw new BadRequestException(
        'Cannot delete role that has users assigned',
      );
    }

    await this.roleRepository.delete(id);

    // Log the deletion
    await this.auditService.log({
      userId: deletedById,
      action: AuditAction.ROLE_REMOVED,
      resource: 'role',
      resourceId: id,
      details: { deletedRole: { id: role.id, name: role.name } },
    });

    return { message: 'Role deleted successfully' };
  }

  async assignPermissions(
    id: string,
    assignPermissionsDto: AssignPermissionsDto,
    assignedById?: string,
  ): Promise<Role> {
    const role = await this.findById(id);
    const { permissionIds } = assignPermissionsDto;

    // Get permissions
    const permissions = await this.permissionRepository.findBy({
      id: In(permissionIds),
    });
    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('One or more permissions not found');
    }

    // Update role permissions
    role.permissions = permissions;
    await this.roleRepository.save(role);

    // Log the permission assignment
    await this.auditService.log({
      userId: assignedById,
      action: AuditAction.PERMISSION_GRANTED,
      resource: 'role',
      resourceId: id,
      details: {
        assignedPermissions: permissions.map((p) => ({
          id: p.id,
          name: p.name,
        })),
      },
    });

    return this.findById(id);
  }

  async removePermission(
    id: string,
    permissionId: string,
    removedById?: string,
  ): Promise<Role> {
    const role = await this.findById(id);

    const permissionToRemove = role.permissions.find(
      (perm) => perm.id === permissionId,
    );
    if (!permissionToRemove) {
      throw new BadRequestException('Role does not have this permission');
    }

    // Remove permission
    role.permissions = role.permissions.filter(
      (perm) => perm.id !== permissionId,
    );
    await this.roleRepository.save(role);

    // Log the permission removal
    await this.auditService.log({
      userId: removedById,
      action: AuditAction.PERMISSION_REVOKED,
      resource: 'role',
      resourceId: id,
      details: {
        removedPermission: {
          id: permissionToRemove.id,
          name: permissionToRemove.name,
        },
      },
    });

    return this.findById(id);
  }

  async findActiveRoles(): Promise<Role[]> {
    return this.roleRepository.find({
      where: { isActive: true },
      relations: ['permissions'],
      order: { hierarchyLevel: 'DESC', name: 'ASC' },
    });
  }

  async getRoleStats(): Promise<{
    totalRoles: number;
    activeRoles: number;
    systemRoles: number;
    customRoles: number;
  }> {
    const [totalRoles, activeRoles, systemRoles] = await Promise.all([
      this.roleRepository.count(),
      this.roleRepository.count({ where: { isActive: true } }),
      this.roleRepository.count({ where: { type: RoleType.SYSTEM } }),
    ]);

    const customRoles = totalRoles - systemRoles;

    return { totalRoles, activeRoles, systemRoles, customRoles };
  }
}
