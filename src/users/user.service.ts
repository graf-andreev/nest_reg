import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetAllUsersDto } from './dto/get-all-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllUsers(query: GetAllUsersDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;
    return this.prismaService.user.findMany({
      where: {
        deletedAt: null,
        ...(query.search
          ? {
              OR: [
                {
                  login: {
                    contains: search,
                    mode: 'insensitive' as const,
                  },
                },
              ],
            }
          : {}),
      },
      skip,
      take: limit,
      omit: {
        deletedAt: true,
        password: true,
        session: true,
      },
    });
  }

  async getUser(userId: number) {
    return this.prismaService.user.findFirst({
      where: { id: userId, deletedAt: null },
      omit: {
        password: true,
        session: true,
      },
    });
  }

  async deleteUser(userId: number) {
    await this.prismaService.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        session: null,
      },
    });
    return { success: true };
  }

  async updateUser(userId: number, dto: UpdateUserDto) {
    return this.prismaService.user.update({
      where: { id: userId },
      data: dto,
      omit: {
        password: true,
        session: true,
      },
    });
  }
}
