import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '@app/prisma';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { IsAdminGuard } from './guards/is-admin.guard';
import { JwtAuthService } from './jwt-auth.service';

@Global()
@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '7d'),
        },
      }),
    }),
  ],
  providers: [JwtAccessGuard, IsAdminGuard, JwtAuthService],
  exports: [JwtModule, JwtAccessGuard, IsAdminGuard, JwtAuthService],
})
export class JwtAuthModule {}
