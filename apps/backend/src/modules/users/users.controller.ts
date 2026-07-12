import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentUserContext } from '../auth/decorators/current-user-context.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUserContextGuard } from '../auth/guards/current-user-context.guard';
import type { JwtUser } from '../auth/types/jwt-user.type';
import type { CurrentUserContext as CurrentUserContextType } from '../auth/types/current-user-context.type';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpsertUserAttributeDto } from './dto/upsert-user-attribute.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, CurrentUserContextGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Get current user context (RBAC + ABAC attributes)',
  })
  @Get('me/context')
  getCurrentUserContext(
    @CurrentUserContext() userContext: CurrentUserContextType,
  ) {
    return userContext;
  }

  @ApiOperation({ summary: 'Get current user classification profile' })
  @Get('me/profile')
  getCurrentUserProfile(@CurrentUser() user: JwtUser) {
    return this.usersService.getCurrentUserProfile(user.userId);
  }

  @ApiOperation({
    summary: 'Create or update current user classification profile',
  })
  @Put('me/profile')
  updateCurrentUserProfile(
    @CurrentUser() user: JwtUser,
    @Body() body: UpdateUserProfileDto,
  ) {
    return this.usersService.upsertCurrentUserProfile(user.userId, body);
  }

  @ApiOperation({ summary: 'List current user custom attributes' })
  @Get('me/attributes')
  listCurrentUserAttributes(@CurrentUser() user: JwtUser) {
    return this.usersService.listCurrentUserAttributes(user.userId);
  }

  @ApiOperation({ summary: 'Set a current user custom attribute' })
  @ApiParam({ name: 'key', example: 'project' })
  @Put('me/attributes/:key')
  upsertCurrentUserAttribute(
    @CurrentUser() user: JwtUser,
    @Param('key') key: string,
    @Body() body: UpsertUserAttributeDto,
  ) {
    return this.usersService.upsertCurrentUserAttribute(
      user.userId,
      key,
      body.value,
    );
  }

  @ApiOperation({ summary: 'Soft-delete a current user custom attribute' })
  @ApiParam({ name: 'key', example: 'project' })
  @Delete('me/attributes/:key')
  removeCurrentUserAttribute(
    @CurrentUser() user: JwtUser,
    @Param('key') key: string,
  ) {
    return this.usersService.removeCurrentUserAttribute(user.userId, key);
  }
}
