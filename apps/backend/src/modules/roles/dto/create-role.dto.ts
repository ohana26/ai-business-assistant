import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'SUPPORT_AGENT' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiProperty({
    required: false,
    example: 'Can assist users in workspace flows',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
