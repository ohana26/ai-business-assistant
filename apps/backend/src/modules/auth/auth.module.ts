import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DatabaseModule } from '../../database/database.module';
import { AuditModule } from '../audit/audit.module';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { CurrentUserContextGuard } from './guards/current-user-context.guard';
import { RoleGuard } from './guards/role.guard';
import { AttributeGuard } from './guards/attribute.guard';
import { AbacEvaluatorService } from './services/abac-evaluator.service';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    DatabaseModule,
    AuditModule,
    PermissionsModule,
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    CurrentUserContextGuard,
    RoleGuard,
    AttributeGuard,
    AbacEvaluatorService,
  ],
  exports: [
    AuthService,
    CurrentUserContextGuard,
    RoleGuard,
    AttributeGuard,
    AbacEvaluatorService,
    PermissionsModule,
  ],
})
export class AuthModule {}
