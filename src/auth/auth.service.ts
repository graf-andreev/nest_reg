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

    const payload = { sub: newUser.id, email: newUser.email };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    const hashedSession = await bcrypt.hash(refreshToken, 10);
    await this.prismaService.user.update({
      where: {
        id: newUser.id,
      },
      data: {
        session: hashedSession,
      },
    });

    return {
      login: createUserDto.login,
      email: createUserDto.email,
      age: createUserDto.age,
      about: createUserDto.about,
      accessToken,
      refreshToken,
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

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: userLoginData.id,
        email: userLoginData.email,
      },
      {
        expiresIn: '7d',
      },
    );
    const accessToken = await this.jwtService.signAsync(
      {
        sub: userLoginData.id,
        email: userLoginData.email,
      },
      {
        expiresIn: '15m',
      },
    );

    const hashedSession = await bcrypt.hash(refreshToken, 10);
    await this.prismaService.user.update({
      where: { id: userLoginData.id },
      data: { session: hashedSession },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshUserToken(oldToken: string) {

  }
}
