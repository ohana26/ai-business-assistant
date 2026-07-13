import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Patch,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUserContext } from '../auth/decorators/current-user-context.decorator';
import { RequireRole } from '../auth/decorators/require-role.decorator';
import { RBAC_PERMISSIONS, RBAC_ROLES } from '../auth/constants/rbac.constants';
import { CurrentUserContextGuard } from '../auth/guards/current-user-context.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import type { CurrentUserContext as CurrentUserContextType } from '../auth/types/current-user-context.type';
import { RequirePermission } from '../permissions/decorators/require-permission.decorator';
import { PermissionsGuard } from '../permissions/permissions.guard';
import { AssistantChatDto } from './dto/assistant-chat.dto';
import { UpdateAssistantProfileDto } from './dto/update-assistant-profile.dto';
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
      conversationId: body.conversationId,
      debug: body.debug,
    });
  }

  @ApiOperation({
    summary: 'List assistant conversations for current workspace',
  })
  @ApiHeader({
    name: 'x-company-id',
    required: true,
    description: 'Company context for tenant isolation',
  })
  @ApiHeader({
    name: 'x-workspace-id',
    required: true,
    description: 'Workspace context for conversation isolation',
  })
  @Get('conversations')
  @UseGuards(JwtAuthGuard, CurrentUserContextGuard, PermissionsGuard)
  @RequirePermission(RBAC_PERMISSIONS.ASSISTANT_CHAT)
  listConversations(
    @CurrentUserContext() userContext: CurrentUserContextType,
    @Headers('x-company-id') companyId: string | undefined,
    @Headers('x-workspace-id') workspaceId: string | undefined,
  ) {
    return this.assistantsService.listConversations({
      userContext,
      companyId,
      workspaceId,
    });
  }

  @ApiOperation({
    summary: 'List messages for a conversation',
  })
  @ApiHeader({
    name: 'x-company-id',
    required: true,
    description: 'Company context for tenant isolation',
  })
  @ApiHeader({
    name: 'x-workspace-id',
    required: true,
    description: 'Workspace context for conversation isolation',
  })
  @Get('conversations/:conversationId/messages')
  @UseGuards(JwtAuthGuard, CurrentUserContextGuard, PermissionsGuard)
  @RequirePermission(RBAC_PERMISSIONS.ASSISTANT_CHAT)
  listConversationMessages(
    @CurrentUserContext() userContext: CurrentUserContextType,
    @Headers('x-company-id') companyId: string | undefined,
    @Headers('x-workspace-id') workspaceId: string | undefined,
    @Param('conversationId') conversationId: string,
  ) {
    return this.assistantsService.listConversationMessages({
      userContext,
      companyId,
      workspaceId,
      conversationId,
    });
  }

  @ApiOperation({
    summary: 'List current user memories scoped to company',
  })
  @ApiHeader({
    name: 'x-company-id',
    required: true,
    description: 'Company context for tenant isolation',
  })
  @Get('memory')
  @UseGuards(JwtAuthGuard, CurrentUserContextGuard)
  listMemory(
    @CurrentUserContext() userContext: CurrentUserContextType,
    @Headers('x-company-id') companyId: string | undefined,
  ) {
    return this.assistantsService.listMemories({
      userContext,
      companyId,
    });
  }

  @ApiOperation({
    summary: 'Delete current user memory by id',
  })
  @ApiHeader({
    name: 'x-company-id',
    required: true,
    description: 'Company context for tenant isolation',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Memory ID',
  })
  @Delete('memory/:id')
  @UseGuards(JwtAuthGuard, CurrentUserContextGuard)
  deleteMemory(
    @CurrentUserContext() userContext: CurrentUserContextType,
    @Headers('x-company-id') companyId: string | undefined,
    @Param('id', new ParseUUIDPipe()) memoryId: string,
  ) {
    return this.assistantsService.deleteMemory({
      userContext,
      companyId,
      memoryId,
    });
  }

  @ApiOperation({
    summary: 'List company assistant profiles (admin only)',
  })
  @ApiHeader({
    name: 'x-company-id',
    required: true,
    description: 'Company context for tenant isolation',
  })
  @Get('profiles')
  @UseGuards(JwtAuthGuard, CurrentUserContextGuard, RoleGuard, PermissionsGuard)
  @RequireRole(RBAC_ROLES.COMPANY_ADMIN)
  @RequirePermission(RBAC_PERMISSIONS.ASSISTANT_MANAGE)
  listProfiles(
    @CurrentUserContext() userContext: CurrentUserContextType,
    @Headers('x-company-id') companyId: string | undefined,
  ) {
    return this.assistantsService.listAssistantProfiles({
      userContext,
      companyId,
    });
  }

  @ApiOperation({
    summary: 'Update company assistant profile (admin only)',
  })
  @ApiHeader({
    name: 'x-company-id',
    required: true,
    description: 'Company context for tenant isolation',
  })
  @ApiParam({
    name: 'id',
    format: 'uuid',
    description: 'Assistant profile ID',
  })
  @ApiBody({ type: UpdateAssistantProfileDto })
  @Patch('profiles/:id')
  @UseGuards(JwtAuthGuard, CurrentUserContextGuard, RoleGuard, PermissionsGuard)
  @RequireRole(RBAC_ROLES.COMPANY_ADMIN)
  @RequirePermission(RBAC_PERMISSIONS.ASSISTANT_MANAGE)
  updateProfile(
    @CurrentUserContext() userContext: CurrentUserContextType,
    @Headers('x-company-id') companyId: string | undefined,
    @Param('id', new ParseUUIDPipe()) profileId: string,
    @Body() body: UpdateAssistantProfileDto,
  ) {
    return this.assistantsService.updateAssistantProfile({
      userContext,
      companyId,
      profileId,
      name: body.name,
      systemPrompt: body.systemPrompt,
      behaviorConfig: body.behaviorConfig,
    });
  }
}
