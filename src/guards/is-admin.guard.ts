import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export default class IsAdminGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const payload = request['user'] as { sub: number } | undefined;

    if (!payload?.sub) {
      throw new UnauthorizedException('unauthorized');
    }

    const user = await this.prismaService.user.findFirst({
      where: { id: payload.sub, deletedAt: null },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      throw new ForbiddenException('forbidden');
    }

    return true;
  }
}
