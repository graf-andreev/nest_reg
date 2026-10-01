import { Module } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { BalanceController } from './balance.controller';
import { AuthModule } from '../auth/auth.module';
import JwtAccessGuard from '../guards/jwt-access.guard';

@Module({
  imports: [AuthModule],
  controllers: [BalanceController],
  providers: [BalanceService, JwtAccessGuard],
})
export class BalanceModule {}
