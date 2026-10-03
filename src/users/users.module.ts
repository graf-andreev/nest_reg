import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import JwtAccessGuard from '../guards/jwt-access.guard';
import IsAdminGuard from '../guards/is-admin.guard';

@Module({
  controllers: [UserController],
  providers: [UserService, JwtAccessGuard, IsAdminGuard],
  exports: [UserService],
})
export class UsersModule {}
