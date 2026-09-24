import { Body, Controller, Get, Post, Req, Patch, Query } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import JwtAuthGuard from '../guards/jwt-access.guard';
import { UserService } from './user.service';
import express from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetAllUsersDto } from './dto/get-all-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-all')
  async getAll(@Query() query: GetAllUsersDto) {
    return this.userService.getAllUsers(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-info')
  async getMyInfo(@Req() request: express.Request) {
    const user = request['user'] as { sub: number; email: string };
    return this.userService.getUser(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('delete')
  async deleteMyAcc(@Req() request: express.Request) {
    const user = request['user'] as { sub: number; email: string };
    return this.userService.deleteUser(user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update')
  async updateMyAcc(@Req() request: express.Request, @Body() dto: UpdateUserDto) {
    const user = request['user'] as { sub: number; email: string };
    return this.userService.updateUser(user.sub, dto);
  }
}
