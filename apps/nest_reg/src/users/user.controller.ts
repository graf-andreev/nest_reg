import { Body, Controller, Get, Patch, Query, Req } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAccessGuard, IsAdminGuard } from '@app/auth';
import { UserService } from './user.service';
import express from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetAllUsersDto } from './dto/get-all-user.dto';
import { GetActiveUsersDto } from './dto/get-active-users.dto';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAccessGuard, IsAdminGuard)
  @Get('get-all')
  async getAll(@Query() query: GetAllUsersDto) {
    return this.userService.getAllUsers(query);
  }

  @UseGuards(JwtAccessGuard, IsAdminGuard)
  @Get('active')
  async getActive(@Query() query: GetActiveUsersDto) {
    return this.userService.getActiveUsers(query);
  }

  @UseGuards(JwtAccessGuard)
  @Get('my-info')
  async getMyInfo(@Req() request: express.Request) {
    const user = request['user'] as { sub: number; email: string };
    return this.userService.getUser(user.sub);
  }

  @UseGuards(JwtAccessGuard)
  @Patch('delete')
  async deleteMyAcc(@Req() request: express.Request) {
    const user = request['user'] as { sub: number; email: string };
    return this.userService.deleteUser(user.sub);
  }

  @UseGuards(JwtAccessGuard)
  @Patch('update')
  async updateMyAcc(
    @Req() request: express.Request,
    @Body() dto: UpdateUserDto,
  ) {
    const user = request['user'] as { sub: number; email: string };
    return this.userService.updateUser(user.sub, dto);
  }
}
