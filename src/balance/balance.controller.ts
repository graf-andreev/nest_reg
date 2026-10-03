import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import express from 'express';
import { BalanceService } from './balance.service';
import JwtAccessGuard from '../guards/jwt-access.guard';
import { UpdateBalanceDto } from './dto/update-balance.dto';

@Controller('balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Post('transfer')
  @UseGuards(JwtAccessGuard)
  transfer(
    @Req() request: express.Request,
    @Body() updateBalanceDto: UpdateBalanceDto,
  ) {
    const user = request['user'] as { sub: number };
    return this.balanceService.transferBalance(user.sub, updateBalanceDto);
  }
}
