import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import JwtAccessGuard from '../guards/jwt-access.guard';

@Module({
  controllers: [UserController],
  providers: [UserService, JwtAccessGuard],
  exports: [UserService],
})
export class UsersModule {}
