import { Controller, Post, UseGuards } from '@nestjs/common';
import { BalancesService } from './balances.service';
import { JwtAccessGuard, IsAdminGuard } from '@app/auth';

@Controller('balances')
export class BalancesController {
  constructor(private readonly balancesService: BalancesService) {}

  @UseGuards(JwtAccessGuard, IsAdminGuard)
  @Post('reset-all')
  create() {
    return this.balancesService.enqueueReset();
  }
}
