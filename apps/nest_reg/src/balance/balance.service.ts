import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateBalanceDto } from './dto/update-balance.dto';
import { PrismaService } from '@app/prisma';

@Injectable()
export class BalanceService {
  constructor(private prismaService: PrismaService) {}
  async transferBalance(userId: number, updateBalanceDto: UpdateBalanceDto) {
    const { amount, receiverId } = updateBalanceDto;
    if (userId === receiverId) {
      throw new BadRequestException(
        'Вы пытаетесь отправить деньги самому себе!',
      );
    }

    return this.prismaService.$transaction(async (tx) => {
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
  }
}
