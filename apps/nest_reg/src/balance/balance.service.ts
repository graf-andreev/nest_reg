import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateBalanceDto } from './dto/update-balance.dto';
import { PrismaService } from '@app/prisma';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class BalanceService {
  constructor(
    private prismaService: PrismaService,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  async transferBalance(userId: number, updateBalanceDto: UpdateBalanceDto) {
    const { amount, receiverId } = updateBalanceDto;
    if (userId === receiverId) {
      throw new BadRequestException(
        'Вы пытаетесь отправить деньги самому себе!',
      );
    }

    const result = this.prismaService.$transaction(async (tx) => {
      const sender = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          balance: true,
        },
      });
      if (!sender) throw new NotFoundException('Отправитель не найден');
      if (sender.balance < amount) {
        throw new BadRequestException('Недостаточно денег!');
      }

      const receiver = await tx.user.findUnique({
        where: { id: receiverId },
        select: {
          id: true,
        },
      });

      if (!receiver) {
        throw new NotFoundException('Получатель не найден!');
      }

      const updateBalance = await tx.user.update({
        where: { id: sender.id },
        data: { balance: { decrement: amount } },
      });

      await tx.user.update({
        where: { id: receiverId },
        data: { balance: { increment: amount } },
      });

      return {
        success: true,
        newBalance: updateBalance.balance,
      };
    });

    this.kafkaClient.emit('balance.transferred', {
      key: String(userId),
      value: { userId },
    });
    this.kafkaClient.emit('balance.transferred', {
      key: String(receiverId),
      value: { userId: receiverId },
    });

    return result;
  }
}
