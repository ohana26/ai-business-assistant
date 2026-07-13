import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAssistantProfileDto {
  @ApiPropertyOptional({
    description: 'Assistant profile display name',
    maxLength: 120,
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({
    description: 'System prompt used for this assistant profile',
    maxLength: 12000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(12000)
  systemPrompt?: string;

  @ApiPropertyOptional({
    description: 'Behavior configuration JSON object',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  behaviorConfig?: Record<string, unknown>;
}
