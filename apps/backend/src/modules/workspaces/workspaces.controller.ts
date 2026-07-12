import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUserContext } from '../auth/decorators/current-user-context.decorator';
import { RequireRole } from '../auth/decorators/require-role.decorator';
import { RBAC_ROLES } from '../auth/constants/rbac.constants';
import { CurrentUserContextGuard } from '../auth/guards/current-user-context.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import type { CurrentUserContext as CurrentUserContextType } from '../auth/types/current-user-context.type';

@Controller('workspaces')
export class WorkspacesController {
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
