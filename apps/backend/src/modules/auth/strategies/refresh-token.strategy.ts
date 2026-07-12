import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtUser } from '../types/jwt-user.type';

type RefreshTokenPayload = {
  sub: string;
  email: string;
  tokenId: string;
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    const jwtRefreshSecret = configService.get<string>('JWT_REFRESH_SECRET');
    if (!jwtRefreshSecret) {
      throw new Error('JWT_REFRESH_SECRET is required.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtRefreshSecret,
    });
  }

  validate(payload: RefreshTokenPayload): JwtUser {
    return {
      userId: payload.sub,
      email: payload.email,
      tokenId: payload.tokenId,
    };
  }
}
