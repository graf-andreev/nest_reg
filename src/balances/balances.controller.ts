import { Controller, Post, UseGuards } from '@nestjs/common';
import { BalancesService } from './balances.service';
import JwtAuthGuard from '../guards/jwt-access.guard';
import isAdminGuard from '../guards/is-admin.guard';

@Controller('balances')
export class BalancesController {
  constructor(private readonly balancesService: BalancesService) {}

  @UseGuards(JwtAuthGuard, isAdminGuard)
  @Post('reset-all')
  create() {
    return this.balancesService.enqueueReset();
  }
}
