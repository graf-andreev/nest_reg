import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export default class JwtAccessGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('no token');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: number;
        email: string;
        type: string;
      }>(token);

      if (payload.type !== 'access') {
        throw new UnauthorizedException('unauthorized');
      }

      const user = await this.prismaService.user.findFirst({
        where: { id: payload.sub, deletedAt: null },
        select: { id: true },
      });

      if (!user) {
        throw new UnauthorizedException('unauthorized');
      }

      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('unauthorized');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authorization = request.headers.authorization;
    if (!authorization) return undefined;
    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
