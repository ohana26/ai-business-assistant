import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DatabaseModule } from '../../database/database.module';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

@Module({
  imports: [DatabaseModule, PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy],
  exports: [AuthService],
})
export class AuthModule {}
