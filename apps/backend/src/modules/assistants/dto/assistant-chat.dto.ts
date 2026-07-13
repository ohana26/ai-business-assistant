import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class AssistantChatDto {
  @ApiProperty({ example: 'What does our refund policy say?' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  message!: string;

  @ApiProperty({
    required: false,
    format: 'uuid',
    description: 'Existing conversation id. If omitted, a new one is created.',
  })
  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @ApiPropertyOptional({
    description:
      'When true, includes retrieval/prompt/latency diagnostics in the response for debugging.',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  debug?: boolean;
}
