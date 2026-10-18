import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { NotificationServiceModule } from './notification-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'notification-service',
        brokers: [process.env.KAFKA_BROKER ?? 'localhost:9092'],
      },
      consumer: {
        groupId: 'notification-consumer',
      },
    },
  });

  app.useWebSocketAdapter(new IoAdapter(app));
  await app.startAllMicroservices();
  await app.listen(process.env.port ?? 3001);
}

void bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack : String(error);
  console.error('Failed to start', message);
  process.exit(1);
});
