import { Module } from '@nestjs/common';
import { BalancesService } from './balances.service';
import { BalancesController } from './balances.controller';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { ResetBalanceJob } from './reset-balance.job';
import JwtAuthGuard from '../guards/jwt-access.guard';
import isAdminGuard from '../guards/is-admin.guard';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          host: config.get('REDIS_HOST', 'localhost'),
          port: Number(config.get('REDIS_PORT', 6379)),
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          password: config.get('REDIS_PASSWORD') || undefined,
        },
      }),
    }),
    BullModule.registerQueue({ name: 'reset-balance' }),
  ],
  controllers: [BalancesController],
  providers: [BalancesService, ResetBalanceJob, JwtAuthGuard, isAdminGuard],
})
export class BalancesModule {}
