import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUserContext } from '../auth/decorators/current-user-context.decorator';
import { RequireRole } from '../auth/decorators/require-role.decorator';
import { RBAC_ROLES } from '../auth/constants/rbac.constants';
import { CurrentUserContextGuard } from '../auth/guards/current-user-context.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import type { CurrentUserContext as CurrentUserContextType } from '../auth/types/current-user-context.type';

@ApiTags('Workspaces')
@ApiBearerAuth('access-token')
@Controller('workspaces')
export class WorkspacesController {
  @ApiOperation({
    summary: 'Workspace management endpoint',
    description: 'Requires role: SUPER_ADMIN or COMPANY_ADMIN',
  })
  @Get('manage')
  @UseGuards(JwtAuthGuard, CurrentUserContextGuard, RoleGuard)
  @RequireRole(RBAC_ROLES.SUPER_ADMIN, RBAC_ROLES.COMPANY_ADMIN)
  manageWorkspaces(@CurrentUserContext() userContext: CurrentUserContextType) {
    return {
      message: 'Workspace manage endpoint placeholder',
      userContext,
    };
  }
}
