import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '@app/prisma';

@Processor('reset-balance')
export class ResetBalanceJob extends WorkerHost {
  private readonly logger = new Logger(ResetBalanceJob.name);

  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async process(job: Job): Promise<void> {
    if (job.name !== 'reset-all') {
      return;
    }
    const result = await this.prismaService.user.updateMany({
      data: {
        balance: 0,
      },
    });
    this.logger.log(`Reset balances finished, users: ${result.count}`);
  }
}
