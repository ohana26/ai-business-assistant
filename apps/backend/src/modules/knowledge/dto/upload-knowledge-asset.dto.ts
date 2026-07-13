import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UploadKnowledgeAssetDto {
  @ApiProperty({ format: 'uuid' })
  @IsString()
  @IsUUID()
  collectionId!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsString()
  @IsUUID()
  sourceId?: string;
}
