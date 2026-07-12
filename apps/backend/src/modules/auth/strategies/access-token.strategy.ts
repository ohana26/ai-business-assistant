import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtUser } from '../types/jwt-user.type';

type AccessTokenPayload = {
  sub: string;
  email: string;
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    const jwtAccessSecret = configService.get<string>('JWT_ACCESS_SECRET');
    if (!jwtAccessSecret) {
      throw new Error('JWT_ACCESS_SECRET is required.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtAccessSecret,
    });
  }

  validate(payload: AccessTokenPayload): JwtUser {
    return {
      userId: payload.sub,
      email: payload.email,
    };
  }
}
