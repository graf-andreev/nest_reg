import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { CreateUserDto } from '../auth/dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetAllUsersDto } from './dto/get-all-user.dto';
import { RedisService } from '../redis/redis.service';
import { PublicUser } from './user.types';

@Injectable()
export class UserService {
  constructor(
    private readonly redis: RedisService,
    private readonly prismaService: PrismaService,
  ) {}

  async getAllUsers(query: GetAllUsersDto) {
    const { page = 1, limit = 10, search } = query;
    const cashKey = `users:list:${page}:${limit}:${search ?? ''}`;
    const skip = (page - 1) * limit;
    const cash = await this.redis.client.get(cashKey);
    if (!cash) {
      const data = await this.prismaService.user.findMany({
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
          balance: true,
        },
      });
      await this.redis.client.set(cashKey, JSON.stringify(data), 'EX', 30);
      return data;
    } else {
      return JSON.parse(cash) as PublicUser[];
    }
  }

  async getUser(userId: number) {
    const cash = await this.redis.client.get(`user:${userId}`);

    if (!cash) {
      const data = await this.prismaService.user.findFirst({
        where: { id: userId, deletedAt: null },
        omit: {
          password: true,
          session: true,
        },
      });
      await this.redis.client.set(
        `user:${userId}`,
        JSON.stringify(data),
        'EX',
        30,
      );
      return data;
    } else {
      return JSON.parse(cash) as PublicUser;
    }
  }

  async deleteUser(userId: number) {
    await this.prismaService.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        session: null,
      },
    });
    await this.redis.client.del(`user:${userId}`);
    return { success: true };
  }

  async updateUser(userId: number, dto: UpdateUserDto) {
    await this.redis.client.del(`user:${userId}`);
    return this.prismaService.user.update({
      where: { id: userId },
      data: dto,
      omit: {
        password: true,
        session: true,
      },
    });
  }

  async create(dto: CreateUserDto) {
    const password = await bcrypt.hash(dto.password, 10);
    return this.prismaService.user.create({
      data: {
        login: dto.login,
        email: dto.email,
        password,
        age: dto.age,
        about: dto.about,
      },
    });
  }
}
