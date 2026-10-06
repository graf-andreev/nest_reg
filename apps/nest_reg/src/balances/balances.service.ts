import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class BalancesService implements OnModuleInit {
  private readonly logger = new Logger(BalancesService.name);

  constructor(
    @InjectQueue('reset-balance') private readonly resetBalanceQueue: Queue,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.resetBalanceQueue.upsertJobScheduler(
      'reset-all-every-10-min',
      {
        every: 10 * 60 * 1000,
      },
      {
        name: 'reset-all',
        data: {},
      },
    );
  }

  async enqueueReset(): Promise<{ success: true }> {
    await this.resetBalanceQueue.add('reset-all', {});
    this.logger.log('Reset balances job queued');
    return { success: true };
  }
}
