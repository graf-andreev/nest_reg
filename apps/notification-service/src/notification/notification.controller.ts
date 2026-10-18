import { Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import type { BalanceTransferredPayload } from './balance-transferred.payload';
import { NotificationGateway } from './notification.gateway';
import { NotificationService } from './notification.service';

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

  @Post(':userId')
  sendNotification(@Param('userId', ParseIntPipe) userId: number) {
    this.notificationGateway.sendNotification(userId);
    return { success: true };
  }
}
