import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RBAC_PERMISSIONS } from '../auth/constants/rbac.constants';
import { CurrentUserContextGuard } from '../auth/guards/current-user-context.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtUser } from '../auth/types/jwt-user.type';
import { RequirePermission } from '../permissions/decorators/require-permission.decorator';
import { PermissionsGuard } from '../permissions/permissions.guard';
import { AssignMembershipRoleDto } from './dto/assign-membership-role.dto';
import { AssignRolePermissionsDto } from './dto/assign-role-permissions.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';

@ApiTags('Roles')
@ApiBearerAuth('access-token')
@ApiHeader({
  name: 'x-company-id',
  required: true,
  description: 'Company scope for RBAC operations',
})
@UseGuards(JwtAuthGuard, CurrentUserContextGuard, PermissionsGuard)
@RequirePermission(RBAC_PERMISSIONS.COMPANY_MANAGE)
@Controller()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @ApiOperation({ summary: 'List roles available for company' })
  @Get('roles')
  getRoles(@Req() request: Request) {
    return this.rolesService.listRoles(this.getCompanyId(request));
  }

  @ApiOperation({ summary: 'Create a company role' })
  @Post('roles')
  createRole(
    @Req() request: Request,
    @CurrentUser() user: JwtUser,
    @Body() body: CreateRoleDto,
  ) {
    return this.rolesService.createRole(
      this.getCompanyId(request),
      user.userId,
      body,
    );
  }

  @ApiOperation({ summary: 'Update a company role' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @Patch('roles/:id')
  updateRole(
    @Req() request: Request,
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() body: UpdateRoleDto,
  ) {
    return this.rolesService.updateRole(
      this.getCompanyId(request),
      id,
      body,
      user.userId,
    );
  }

  @ApiOperation({ summary: 'Assign permissions to a role' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @Post('roles/:id/permissions')
  assignPermissionsToRole(
    @Req() request: Request,
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() body: AssignRolePermissionsDto,
  ) {
    return this.rolesService.assignPermissionsToRole(
      this.getCompanyId(request),
      id,
      body,
      user.userId,
    );
  }

  @ApiOperation({ summary: 'Assign a role to a membership' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @Post('memberships/:id/role')
  assignRoleToMembership(
    @Req() request: Request,
    @CurrentUser() user: JwtUser,
    @Param('id') id: string,
    @Body() body: AssignMembershipRoleDto,
  ) {
    return this.rolesService.assignRoleToMembership(
      this.getCompanyId(request),
      id,
      body,
      user.userId,
    );
  }

  private getCompanyId(request: Request): string {
    const rawHeader = request.headers['x-company-id'];
    const companyId = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
    if (!companyId) {
      throw new BadRequestException('x-company-id header is required');
    }

    return companyId;
  }
}
