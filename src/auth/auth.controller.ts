import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import express from 'express';
import { LoginUserDto } from './dto/login-user.dto';
import { setRefreshCookie } from './set-refresh-cookie';

function asOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerUser(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) response: express.Response,
  ) {
    const result = await this.authService.registerUser(createUserDto);
    setRefreshCookie(response, result.refreshToken);
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
    setRefreshCookie(response, result.refreshToken);
    return {
      accessToken: result.accessToken,
    };
  }

  @ApiCookieAuth('refreshToken')
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Reads httpOnly cookie refreshToken (set on register/login) and issues a new pair.',
  })
  @Post('refresh')
  async refreshToken(
    @Req() request: express.Request,
    @Res({ passthrough: true }) response: express.Response,
  ) {
    const oldToken = asOptionalString(
      request.cookies['refreshToken'] as unknown,
    );
    const result = await this.authService.refreshUserToken(oldToken);
    setRefreshCookie(response, result.refreshToken);
    return {
      accessToken: result.accessToken,
    };
  }
}
