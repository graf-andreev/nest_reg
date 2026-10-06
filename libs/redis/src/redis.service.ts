import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnApplicationShutdown {
  readonly client: Redis;

  constructor(configService: ConfigService) {
    this.client = new Redis({
      host: configService.get<string>('REDIS_HOST', 'localhost'),
      port: Number(configService.get('REDIS_PORT', 6379)),
      password: configService.get<string>('REDIS_PASSWORD') || undefined,
    });
  }

  async onApplicationShutdown() {
    await this.client.quit();
  }
}
