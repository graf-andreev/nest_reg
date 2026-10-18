import { Module } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { BalanceController } from './balance.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

ClientsModule.register([
  {
    name: 'KAFKA_SERVICE',
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'user-service',
        brokers: [process.env.KAFKA_BROKER ?? 'localhost:9092'],
      },
      producerOnlyMode: true,
    },
  },
]);

@Module({
  controllers: [BalanceController],
  providers: [BalanceService],
})
export class BalanceModule {}
