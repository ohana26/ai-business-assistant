import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUserContext } from '../auth/decorators/current-user-context.decorator';
import { RequireAttributes } from '../auth/decorators/require-attributes.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { AttributeGuard } from '../auth/guards/attribute.guard';
import { RBAC_PERMISSIONS } from '../auth/constants/rbac.constants';
import { CurrentUserContextGuard } from '../auth/guards/current-user-context.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import type { CurrentUserContext as CurrentUserContextType } from '../auth/types/current-user-context.type';

@Controller('knowledge')
export class KnowledgeController {
  @Get()
  @UseGuards(JwtAuthGuard, CurrentUserContextGuard, PermissionGuard)
  @RequirePermission(RBAC_PERMISSIONS.KNOWLEDGE_VIEW)
  getKnowledge(@CurrentUserContext() userContext: CurrentUserContextType) {
    return {
      message: 'Knowledge view endpoint placeholder',
      userContext,
    };
  }

  @Post('upload')
  @UseGuards(
    JwtAuthGuard,
    CurrentUserContextGuard,
    PermissionGuard,
    AttributeGuard,
  )
  @RequirePermission(RBAC_PERMISSIONS.KNOWLEDGE_UPLOAD)
  @RequireAttributes({ key: 'securityLevel', value: 'CONFIDENTIAL' })
  uploadKnowledge(@CurrentUserContext() userContext: CurrentUserContextType) {
    return {
      message: 'Knowledge upload endpoint placeholder',
      userContext,
    };
  }
}
