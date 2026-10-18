import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { DefaultEventsMap, Server, Socket } from 'socket.io';
import { JwtAuthService } from '@app/auth';

type NotificationSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  { userId?: number }
>;

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: '*',
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  constructor(private readonly jwtAuthService: JwtAuthService) {}

  handleConnection(client: NotificationSocket) {
    this.logger.log(`Client connected: ${client.id}`);

    try {
      const userId = this.jwtAuthService.verifyAccessToken(
        this.getAuthorization(client),
      );
      client.data.userId = userId;
      void client.join(String(userId));
      this.logger.log(`Client ${client.id} joined room ${userId}`);
    } catch {
      this.logger.warn(`Client ${client.id} rejected: invalid token`);
      client.disconnect();
    }
  }

  handleDisconnect(client: NotificationSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('events')
  handleEvent(
    @MessageBody() data: string,
    @ConnectedSocket() client: NotificationSocket,
  ): string {
    client.emit('events', data);
    return data;
  }

  sendNotification(userId: number) {
    this.server.to(String(userId)).emit('notification', { data: 'hello!' });
  }

  private getAuthorization(client: NotificationSocket): string | undefined {
    const header = client.handshake.headers.authorization;
    if (typeof header === 'string') {
      return header;
    }
    if (Array.isArray(header) && typeof header[0] === 'string') {
      return header[0];
    }

    const token: unknown = (client.handshake.auth as { token?: unknown }).token;
    return typeof token === 'string' ? token : undefined;
  }
}
