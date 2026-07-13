import { ApiPropertyOptional } from '@nestjs/swagger';
import { KnowledgeAssetStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class ListKnowledgeAssetsDto {
  @ApiPropertyOptional({
    enum: KnowledgeAssetStatus,
    description: 'Filter assets by processing status',
  })
  @IsOptional()
  @IsEnum(KnowledgeAssetStatus)
  status?: KnowledgeAssetStatus;
}
