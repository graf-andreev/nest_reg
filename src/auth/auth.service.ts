import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async registerUser(createUserDto: CreateUserDto) {
    const password = await bcrypt.hash(createUserDto.password, 10);

    const newUser = await this.prismaService.user.create({
      data: {
        login: createUserDto.login,
        email: createUserDto.email,
        password: password,
        age: createUserDto.age,
        about: createUserDto.about,
      },
    });

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

    let payload: { sub: number; email: string };
    try {
      payload = await this.jwtService.verifyAsync<{
        sub: number;
        email: string;
      }>(oldToken);
    } catch {
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

    const isSessionValid = await bcrypt.compare(oldToken, user.session);
    if (!isSessionValid) {
      throw new UnauthorizedException('unauthorized');
    }

    return this.issueTokens({
      id: user.id,
      email: user.email,
    });
  }

  private async issueTokens(user: { id: number; email: string }) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(
      { ...payload, type: 'access' },
      { expiresIn: '15m' },
    );
    const refreshToken = await this.jwtService.signAsync(
      { ...payload, type: 'refresh' },
      { expiresIn: '7d' },
    );

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { session: await bcrypt.hash(refreshToken, 10) },
    });

    return { accessToken, refreshToken };
  }
}
