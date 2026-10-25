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

    const result = await this.prismaService.$transaction(async (tx) => {
      const receiver = await tx.user.findFirst({
        where: { id: receiverId, deletedAt: null },
        select: { id: true },
      });
      if (!receiver) {
        throw new NotFoundException('Получатель не найден!');
      }

      const debited = await tx.user.updateMany({
        where: { id: userId, deletedAt: null, balance: { gte: amount } },
        data: { balance: { decrement: amount } },
      });

      if (debited.count === 0) {
        const sender = await tx.user.findFirst({
          where: { id: userId, deletedAt: null },
          select: { id: true },
        });
        if (!sender) throw new NotFoundException('Отправитель не найден');
        throw new BadRequestException('Недостаточно денег!');
      }

      await tx.user.update({
        where: { id: receiverId },
        data: { balance: { increment: amount } },
      });

      const sender = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: { balance: true },
      });

      return {
        success: true,
        newBalance: sender.balance,
      };
    });

    this.kafkaClient.emit('balance.transferred', {
      key: String(userId),
      value: {
        senderId: userId,
        receiverId,
        amount,
        createdAt: new Date().toISOString(),
      },
    });

    return result;
  }
}
