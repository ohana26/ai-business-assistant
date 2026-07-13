import { Body, Controller, Headers, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUserContext } from '../auth/decorators/current-user-context.decorator';
import { RBAC_PERMISSIONS } from '../auth/constants/rbac.constants';
import { CurrentUserContextGuard } from '../auth/guards/current-user-context.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { CurrentUserContext as CurrentUserContextType } from '../auth/types/current-user-context.type';
import { RequirePermission } from '../permissions/decorators/require-permission.decorator';
import { PermissionsGuard } from '../permissions/permissions.guard';
import { AssistantChatDto } from './dto/assistant-chat.dto';
import { AssistantsService } from './assistants.service';

@ApiTags('Assistant')
@ApiBearerAuth('access-token')
@Controller('assistant')
export class AssistantsController {
  constructor(private readonly assistantsService: AssistantsService) {}

  @ApiOperation({
    summary: 'Ask assistant using workspace knowledge context',
  })
  @ApiHeader({
    name: 'x-company-id',
    required: true,
    description: 'Company context for tenant isolation',
  })
  @ApiHeader({
    name: 'x-workspace-id',
    required: true,
    description: 'Workspace context for retrieval isolation',
  })
  @ApiBody({ type: AssistantChatDto })
  @Post('chat')
  @UseGuards(JwtAuthGuard, CurrentUserContextGuard, PermissionsGuard)
  @RequirePermission(RBAC_PERMISSIONS.ASSISTANT_CHAT)
  chat(
    @CurrentUserContext() userContext: CurrentUserContextType,
    @Headers('x-company-id') companyId: string | undefined,
    @Headers('x-workspace-id') workspaceId: string | undefined,
    @Body() body: AssistantChatDto,
  ) {
    return this.assistantsService.chat({
      userContext,
      companyId,
      workspaceId,
      message: body.message,
    });
  }
}
