import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class AssignRolePermissionsDto {
  @ApiProperty({
    type: [String],
    example: ['assistant.chat', 'assistant.create'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  permissionKeys!: string[];
}
