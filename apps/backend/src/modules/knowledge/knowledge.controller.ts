import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUserContext } from '../auth/decorators/current-user-context.decorator';
import { RBAC_PERMISSIONS } from '../auth/constants/rbac.constants';
import { CurrentUserContextGuard } from '../auth/guards/current-user-context.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { CurrentUserContext as CurrentUserContextType } from '../auth/types/current-user-context.type';
import { UploadKnowledgeAssetDto } from './dto/upload-knowledge-asset.dto';
import type { UploadedKnowledgeFile } from './types/uploaded-knowledge-file.type';
import { RequirePermission } from '../permissions/decorators/require-permission.decorator';
import { PermissionsGuard } from '../permissions/permissions.guard';
import { KnowledgeService } from './knowledge.service';

@ApiTags('Knowledge')
@ApiBearerAuth('access-token')
@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @ApiOperation({
    summary: 'View knowledge content',
    description: 'Requires permission: knowledge.view',
  })
  @Get()
  @UseGuards(JwtAuthGuard, CurrentUserContextGuard, PermissionsGuard)
  @RequirePermission(RBAC_PERMISSIONS.KNOWLEDGE_VIEW)
  getKnowledge(@CurrentUserContext() userContext: CurrentUserContextType) {
    return {
      message: 'Knowledge view endpoint placeholder',
      userContext,
    };
  }

  @ApiOperation({
    summary: 'Upload knowledge asset into workspace collection',
    description:
      'Requires knowledge.upload permission and explicit company/workspace context headers.',
  })
  @ApiHeader({
    name: 'x-company-id',
    required: true,
    description: 'Company context for tenant isolation',
  })
  @ApiHeader({
    name: 'x-workspace-id',
    required: true,
    description: 'Workspace context for upload authorization',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'collectionId'],
      properties: {
        file: { type: 'string', format: 'binary' },
        collectionId: { type: 'string', format: 'uuid' },
        sourceId: { type: 'string', format: 'uuid' },
      },
    },
  })
  @Post('assets/upload')
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(JwtAuthGuard, CurrentUserContextGuard, PermissionsGuard)
  @RequirePermission(RBAC_PERMISSIONS.KNOWLEDGE_UPLOAD)
  uploadKnowledge(
    @CurrentUserContext() userContext: CurrentUserContextType,
    @UploadedFile() file: UploadedKnowledgeFile | undefined,
    @Body() body: UploadKnowledgeAssetDto,
    @Headers('x-company-id') companyId: string | undefined,
    @Headers('x-workspace-id') workspaceId: string | undefined,
  ) {
    return this.knowledgeService.uploadKnowledgeAsset(
      userContext,
      file,
      body,
      companyId,
      workspaceId,
    );
  }
}
