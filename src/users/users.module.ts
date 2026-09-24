import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import JwtAccessGuard from '../guards/jwt-access.guard';

@Module({
  imports: [AuthModule],
  controllers: [UserController],
  providers: [UserService, JwtAccessGuard],
})
export class UsersModule {}
