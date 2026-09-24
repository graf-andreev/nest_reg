import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import * as process from 'node:process';

@Injectable()
export default class JwtAccessGuard implements CanActivate {
  constructor(private jwtService: JwtService, private prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const token = this.extractTokenFromHeader(request);

    const tokenPayload = await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_SECRET;
    })

    const isDeleted = this.prismaService.user.findUnique({
      where: {id: token.sub}
    })

    if (!token) {
      throw new UnauthorizedException('no token');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: number;
        email: string;
      }>(token);
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
