import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BalanceModule } from './balance/balance.module';
import { AvatarsModule } from './avatars/avatars.module';
import { BalancesModule } from './balances/balances.module';
import { CommonModule } from '@app/common';
import { PrismaModule } from '@app/prisma';
import { RedisModule } from '@app/redis';
import { JwtAuthModule } from '@app/auth';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CommonModule,
    PrismaModule,
    RedisModule,
    JwtAuthModule,
    UsersModule,
    AuthModule,
    BalanceModule,
    AvatarsModule,
    BalancesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
