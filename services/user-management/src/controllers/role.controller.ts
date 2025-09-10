import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RoleService } from '../services/role.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  AssignPermissionsDto,
} from '../dto/role.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Roles } from '../decorators/roles.decorator';
import { Permissions } from '../decorators/permissions.decorator';
import { GetUser } from '../decorators/get-user.decorator';
import { User } from '../entities/user.entity';
import { SystemRole } from '../entities/role.entity';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(SystemRole.ADMIN, SystemRole.SUPER_ADMIN)
  async findAll() {
    return this.roleService.findAll();
  }

  @Get('active')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.ADMIN, SystemRole.SUPER_ADMIN, SystemRole.MODERATOR)
  async findActive() {
    return this.roleService.findActiveRoles();
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.ADMIN, SystemRole.SUPER_ADMIN)
  async getRoleStats() {
    return this.roleService.getRoleStats();
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('role:read')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.roleService.findById(id);
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('role:create')
  async create(
    @Body(ValidationPipe) createRoleDto: CreateRoleDto,
    @GetUser() currentUser: User,
  ) {
    return this.roleService.create(createRoleDto, currentUser.id);
  }

  @Put(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('role:update')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateRoleDto: UpdateRoleDto,
    @GetUser() currentUser: User,
  ) {
    return this.roleService.update(id, updateRoleDto, currentUser.id);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('role:delete')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() currentUser: User,
  ) {
    return this.roleService.delete(id, currentUser.id);
  }

  @Post(':id/permissions')
  @UseGuards(PermissionsGuard)
  @Permissions('role:update', 'permission:assign')
  async assignPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) assignPermissionsDto: AssignPermissionsDto,
    @GetUser() currentUser: User,
  ) {
    return this.roleService.assignPermissions(
      id,
      assignPermissionsDto,
      currentUser.id,
    );
  }

  @Delete(':id/permissions/:permissionId')
  @UseGuards(PermissionsGuard)
  @Permissions('role:update', 'permission:assign')
  async removePermission(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('permissionId', ParseUUIDPipe) permissionId: string,
    @GetUser() currentUser: User,
  ) {
    return this.roleService.removePermission(id, permissionId, currentUser.id);
  }
}
