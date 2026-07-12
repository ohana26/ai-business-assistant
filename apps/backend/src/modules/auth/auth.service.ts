import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { JwtUser } from './types/jwt-user.type';
import type { AuthTokens, AuthResponse } from './types/auth-response.type';

@Injectable()
export class AuthService {
  private readonly passwordSaltRounds = 12;
  private readonly refreshTokenSaltRounds = 12;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email.toLowerCase() },
      select: { id: true },
    });

    if (existingUser) {
      throw new BadRequestException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(
      registerDto.password,
      this.passwordSaltRounds,
    );

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email.toLowerCase(),
        passwordHash,
        displayName: registerDto.displayName,
        status: UserStatus.ACTIVE,
      },
    });

    return this.issueTokensForUser(user, true);
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email.toLowerCase() },
    });

    if (!user || user.deletedAt || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.issueTokensForUser(user, false);
  }

  async refreshToken(
    user: JwtUser,
    rawRefreshToken: string,
  ): Promise<AuthResponse> {
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { id: user.tokenId },
    });

    if (
      !storedToken ||
      storedToken.userId !== user.userId ||
      storedToken.revokedAt ||
      storedToken.expiresAt <= new Date()
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenMatches = await bcrypt.compare(
      rawRefreshToken,
      storedToken.tokenHash,
    );
    if (!tokenMatches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const userEntity = await this.prisma.user.findUnique({
      where: { id: user.userId },
    });
    if (
      !userEntity ||
      userEntity.deletedAt ||
      userEntity.status !== UserStatus.ACTIVE
    ) {
      throw new UnauthorizedException('User is not active');
    }

    return this.issueTokensForUser(userEntity, false);
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  private async issueTokensForUser(
    user: Pick<User, 'id' | 'email' | 'displayName'>,
    includeProfile: boolean,
  ): Promise<AuthResponse> {
    const tokens = await this.generateTokens(user.id, user.email);
    await this.storeRefreshToken(
      user.id,
      tokens.refreshToken,
      tokens.refreshTokenId,
    );

    return {
      user: includeProfile
        ? {
            id: user.id,
            email: user.email,
            displayName: user.displayName ?? null,
          }
        : undefined,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<AuthTokens> {
    const refreshTokenId = randomUUID();
    const accessTokenPayload = { sub: userId, email };
    const refreshTokenPayload = { sub: userId, email, tokenId: refreshTokenId };
    const accessSecret = this.getRequiredConfig('JWT_ACCESS_SECRET');
    const refreshSecret = this.getRequiredConfig('JWT_REFRESH_SECRET');
    const accessExpiresIn = this.durationToSeconds(
      this.getRequiredConfig('JWT_ACCESS_EXPIRES_IN'),
    );
    const refreshExpiresIn = this.durationToSeconds(
      this.getRequiredConfig('JWT_REFRESH_EXPIRES_IN'),
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessTokenPayload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(refreshTokenPayload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken, refreshTokenId };
  }

  private async storeRefreshToken(
    userId: string,
    refreshToken: string,
    refreshTokenId: string,
  ): Promise<void> {
    const decoded: unknown = this.jwtService.decode(refreshToken);
    if (!decoded || typeof decoded !== 'object') {
      throw new UnauthorizedException('Invalid refresh token expiration');
    }
    const decodedPayload = decoded as Record<string, unknown>;
    const exp = decodedPayload.exp;
    if (typeof exp !== 'number') {
      throw new UnauthorizedException('Invalid refresh token expiration');
    }

    const tokenHash = await bcrypt.hash(
      refreshToken,
      this.refreshTokenSaltRounds,
    );

    await this.prisma.refreshToken.create({
      data: {
        id: refreshTokenId,
        userId,
        tokenHash,
        expiresAt: new Date(exp * 1000),
      },
    });
  }

  private getRequiredConfig(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new UnauthorizedException(`${key} is not configured`);
    }

    return value;
  }

  private durationToSeconds(duration: string): number {
    const match = /^(\d+)([smhd])$/i.exec(duration.trim());
    if (!match) {
      throw new UnauthorizedException(
        `Invalid JWT duration format: ${duration}`,
      );
    }

    const value = Number(match[1]);
    const unit = match[2].toLowerCase();
    const multiplier: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    return value * multiplier[unit];
  }
}
