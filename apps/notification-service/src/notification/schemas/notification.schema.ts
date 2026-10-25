import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ collection: 'notifications' })
export class Notification {
  @Prop({ required: true })
  senderId: number;

  @Prop({ required: true })
  receiverId: number;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  createdAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
