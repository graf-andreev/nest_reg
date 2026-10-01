import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { BalanceService } from './balance.service';
import JwtAccessGuard from '../guards/jwt-access.guard';
import { UpdateBalanceDto } from './dto/update-balance.dto';

@Controller('balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Post('transfer')
  @UseGuards(JwtAccessGuard)
  transfer(@Req() request: any, @Body() updateBalanceDto: UpdateBalanceDto) {

    const userId = request.user.sub;

    return this.balanceService.transferBalance(userId, updateBalanceDto);
  }
}
