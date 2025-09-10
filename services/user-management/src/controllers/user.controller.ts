import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateProfileDto,
  UpdatePreferencesDto,
  AssignRoleDto,
  UserSearchDto,
} from '../dto/user.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Roles } from '../decorators/roles.decorator';
import { Permissions } from '../decorators/permissions.decorator';
import { GetUser } from '../decorators/get-user.decorator';
import { User } from '../entities/user.entity';
import { SystemRole } from '../entities/role.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(SystemRole.ADMIN, SystemRole.SUPER_ADMIN)
  async findAll(@Query() searchDto: UserSearchDto) {
    if (Object.keys(searchDto).length > 0) {
      return this.userService.search(searchDto);
    }
    return { users: await this.userService.findAll() };
  }

  @Get('me')
  async getMyProfile(@GetUser() user: User) {
    return this.userService.findById(user.id);
  }

  @Put('me')
  async updateMyProfile(
    @GetUser() user: User,
    @Body(ValidationPipe) updateProfileDto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(user.id, updateProfileDto);
  }

  @Put('me/preferences')
  async updateMyPreferences(
    @GetUser() user: User,
    @Body(ValidationPipe) updatePreferencesDto: UpdatePreferencesDto,
  ) {
    return this.userService.updatePreferences(user.id, updatePreferencesDto);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(SystemRole.ADMIN, SystemRole.SUPER_ADMIN)
  async getUserStats() {
    return this.userService.getUserStats();
  }

  @Get(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('user:read')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.findById(id);
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @Permissions('user:create')
  async create(
    @Body(ValidationPipe) createUserDto: CreateUserDto,
    @GetUser() currentUser: User,
  ) {
    return this.userService.create(createUserDto, currentUser.id);
  }

  @Put(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('user:update')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
    @GetUser() currentUser: User,
  ) {
    return this.userService.update(id, updateUserDto, currentUser.id);
  }

  @Delete(':id')
  @UseGuards(PermissionsGuard)
  @Permissions('user:delete')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() currentUser: User,
  ) {
    return this.userService.delete(id, currentUser.id);
  }

  @Post(':id/roles')
  @UseGuards(PermissionsGuard)
  @Permissions('user:update', 'role:assign')
  async assignRoles(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) assignRoleDto: AssignRoleDto,
    @GetUser() currentUser: User,
  ) {
    return this.userService.assignRoles(id, assignRoleDto, currentUser.id);
  }

  @Delete(':id/roles/:roleId')
  @UseGuards(PermissionsGuard)
  @Permissions('user:update', 'role:assign')
  async removeRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @GetUser() currentUser: User,
  ) {
    return this.userService.removeRole(id, roleId, currentUser.id);
  }

  @Get(':id/audit-logs')
  @UseGuards(PermissionsGuard)
  @Permissions('user:read', 'audit:read')
  async getUserAuditLogs() {
    // TODO: Implement audit log retrieval via AuditService
    return { message: 'Audit logs endpoint - implementation pending' };
  }
}
