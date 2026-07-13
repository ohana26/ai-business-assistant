import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AssistantChatDto {
  @ApiProperty({ example: 'What does our refund policy say?' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  message!: string;
}
