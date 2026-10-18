import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { BalanceTransferredPayload } from './balance-transferred.payload';
import { Notification } from './schemas/notification.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
  ) {}

  create(payload: BalanceTransferredPayload) {
    return this.notificationModel.create({
      senderId: payload.senderId,
      receiverId: payload.receiverId,
      amount: payload.amount,
      createdAt: new Date(payload.createdAt),
    });
  }
}
