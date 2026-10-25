import {
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import type { BalanceTransferredPayload } from './balance-transferred.payload';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';
import { ApiKeyGuard } from '@app/auth';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationGateway: NotificationGateway,
    private readonly notificationService: NotificationService,
  ) {}

  @EventPattern('balance.transferred')
  handleBalanceTransferred(@Payload() payload: BalanceTransferredPayload) {
    this.notificationGateway.sendNotification(payload.senderId);
    this.notificationGateway.sendNotification(payload.receiverId);
    void this.notificationService.create(payload);
  }

  @UseGuards(ApiKeyGuard)
  @Post(':userId')
  sendNotification(@Param('userId', ParseIntPipe) userId: number) {
    this.notificationGateway.sendNotification(userId);
    return { success: true };
  }
}
