import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import express from 'express';
import * as process from 'node:process';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerUser(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) response: express.Response,
  ) {
    const result = await this.authService.registerUser(createUserDto);
    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
    });
    return {
      user: {
        login: result.login,
        email: result.email,
        age: result.age,
        about: result.about,
      },
      accessToken: result.accessToken,
    };
  }

  @Post('login')
  async userLogin(
    @Body() data: LoginUserDto,
    @Res({ passthrough: true }) response: express.Response,
  ) {
    const result = await this.authService.loginUser(data);
    response.cookie('refreshToken', result?.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
    });
    return {
      accessToken: result.accessToken,
    };
  }

  @Post('refresh')
  async refreshToken(
    @Req() request: express.Request,
    @Res({ passthrough: true }) response: express.Response,
  ) {
    const oldToken: string = request.cookies['refreshToken'];
    const result = await this.authService.refreshUserToken(oldToken);
    response.cookie('refreshToken', result?.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
    });
    return {
      accessToken: result.accessToken,
    }
  }
}
