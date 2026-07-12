import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({ required: false, example: 'SUPPORT_AGENT' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiProperty({
    required: false,
    example: 'Can assist users in workspace flows',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
