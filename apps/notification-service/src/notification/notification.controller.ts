import { Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { EventPattern, Payload } from '@nestjs/microservices';

type BalanceTransferredPayload = {
  userId: number;
};

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationGateway: NotificationGateway) {}

  @EventPattern('balance.transferred')
  handleBalanceTransferred(@Payload() payload: BalanceTransferredPayload) {
    this.notificationGateway.sendNotification(payload.userId);
  }

  @Post(':userId')
  sendNotification(@Param('userId', ParseIntPipe) userId: number) {
    this.notificationGateway.sendNotification(userId);
    return { success: true };
  }
}
