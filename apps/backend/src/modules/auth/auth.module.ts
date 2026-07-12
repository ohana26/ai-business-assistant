import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DatabaseModule } from '../../database/database.module';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { CurrentUserContextGuard } from './guards/current-user-context.guard';
import { PermissionGuard } from './guards/permission.guard';
import { RoleGuard } from './guards/role.guard';
import { AttributeGuard } from './guards/attribute.guard';
import { AbacEvaluatorService } from './services/abac-evaluator.service';

@Module({
  imports: [DatabaseModule, PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    CurrentUserContextGuard,
    PermissionGuard,
    RoleGuard,
    AttributeGuard,
    AbacEvaluatorService,
  ],
  exports: [
    AuthService,
    CurrentUserContextGuard,
    PermissionGuard,
    RoleGuard,
    AttributeGuard,
    AbacEvaluatorService,
  ],
})
export class AuthModule {}
