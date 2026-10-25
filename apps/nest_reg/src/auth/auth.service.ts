import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '@app/prisma';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { UserService } from '../users/user.service';
import * as process from 'node:process';
import { safeEqual, sha256 } from '@app/common';

type JwtExpiresIn = `${number}${'s' | 'm' | 'h' | 'd'}`;

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(createUserDto: CreateUserDto) {
    const newUser = await this.userService.create(createUserDto);

    const tokens = await this.issueTokens({
      id: newUser.id,
      email: newUser.email,
    });

    return {
      login: createUserDto.login,
      email: createUserDto.email,
      age: createUserDto.age,
      about: createUserDto.about,
      ...tokens,
    };
  }

  async loginUser(data: LoginUserDto) {
    const userLoginData = await this.prismaService.user.findFirst({
      where: { login: data.login, deletedAt: null },
      select: {
        id: true,
        password: true,
        login: true,
        email: true,
      },
    });

    if (!userLoginData) {
      throw new UnauthorizedException('wrong password or user login');
    }
    const isPasswordValid = await bcrypt.compare(
      data.password,
      userLoginData.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('wrong password or user login');
    }

    return this.issueTokens({
      id: userLoginData.id,
      email: userLoginData.email,
    });
  }

  async refreshUserToken(oldToken?: string) {
    if (!oldToken) {
      throw new UnauthorizedException('unauthorized');
    }

    let payload: { sub: number; email: string; type: string };
    try {
      payload = await this.jwtService.verifyAsync<{
        sub: number;
        email: string;
        type: string;
      }>(oldToken);
    } catch {
      throw new UnauthorizedException('unauthorized');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('unauthorized');
    }

    const user = await this.prismaService.user.findFirst({
      where: { id: payload.sub, deletedAt: null },
      select: {
        id: true,
        email: true,
        session: true,
      },
    });

    if (!user?.session) {
      throw new UnauthorizedException('unauthorized');
    }

    if (!safeEqual(sha256(oldToken), Buffer.from(user.session, 'hex'))) {
      throw new UnauthorizedException('unauthorized');
    }

    return this.issueTokens({
      id: user.id,
      email: user.email,
    });
  }

  private async issueTokens(user: { id: number; email: string }) {
    const payload = { sub: user.id, email: user.email };
    const accessExpiresIn = (process.env.JWT_ACCESS_EXPIRATION ??
      '15m') as JwtExpiresIn;
    const refreshExpiresIn = (process.env.JWT_REFRESH_EXPIRATION ??
      '7d') as JwtExpiresIn;

    const accessToken = await this.jwtService.signAsync(
      { ...payload, type: 'access' },
      { expiresIn: accessExpiresIn },
    );
    const refreshToken = await this.jwtService.signAsync(
      { ...payload, type: 'refresh' },
      { expiresIn: refreshExpiresIn },
    );

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { session: sha256(refreshToken).toString('hex') },
    });

    return { accessToken, refreshToken };
  }
}
