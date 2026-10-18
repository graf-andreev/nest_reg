import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

type AccessTokenPayload = {
  sub: number;
  email: string;
  type: string;
};

@Injectable()
export class JwtAuthService {
  constructor(private readonly jwtService: JwtService) {}

  verifyAccessToken(authorization?: string): number {
    if (!authorization) {
      throw new UnauthorizedException('no token');
    }

    const token = authorization.startsWith('Bearer ')
      ? authorization.slice(7)
      : authorization;

    const payload = this.jwtService.verify<AccessTokenPayload>(token);
    if (payload.type !== 'access' || typeof payload.sub !== 'number') {
      throw new UnauthorizedException('unauthorized');
    }

    return payload.sub;
  }
}
