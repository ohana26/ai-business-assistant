import { ApiProperty } from '@nestjs/swagger';
import {
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
}
