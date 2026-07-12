import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AssignMembershipRoleDto {
  @ApiProperty({ format: 'uuid' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  roleId!: string;
}
