import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { safeEqual, sha256 } from '@app/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'];
    const expected = this.configService.getOrThrow<string>('INTERNAL_API_KEY');

    if (
      typeof apiKey !== 'string' ||
      !safeEqual(sha256(apiKey), sha256(expected))
    ) {
      throw new UnauthorizedException('invalid api key');
    }

    return true;
  }
}
