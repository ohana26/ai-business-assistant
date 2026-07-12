import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JwtUser } from './types/jwt-user.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refreshToken(@CurrentUser() user: JwtUser, @Req() request: Request) {
    const rawToken = this.extractBearerToken(request);
    return this.authService.refreshToken(user, rawToken);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@CurrentUser() user: JwtUser) {
    await this.authService.logout(user.userId);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getCurrentUser(@CurrentUser() user: JwtUser) {
    return user;
  }

  private extractBearerToken(request: Request): string {
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing refresh token');
    }

    return authorization.slice(7).trim();
  }
}
