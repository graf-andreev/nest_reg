import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationServiceController } from './notification-service.controller';
import { NotificationServiceService } from './notification-service.service';
import { JwtAuthModule } from '@app/auth';
import { CommonModule } from '@app/common';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    JwtAuthModule,
    NotificationModule,
  ],
  controllers: [NotificationServiceController],
  providers: [NotificationServiceService],
})
export class NotificationServiceModule {}
