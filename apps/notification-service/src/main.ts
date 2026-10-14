import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { NotificationServiceModule } from './notification-service.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule);
  app.useWebSocketAdapter(new IoAdapter(app));
  await app.listen(process.env.port ?? 3001);
}

void bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack : String(error);
  console.error('Failed to start', message);
  process.exit(1);
});
