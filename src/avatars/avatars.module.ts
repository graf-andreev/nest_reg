import { Module } from '@nestjs/common';
import { AvatarsService } from './avatars.service';
import { AvatarsController } from './avatars.controller';
import { FilesModule } from '../providers/files.module';
import JwtAccessGuard from '../guards/jwt-access.guard';
import { FileSizeValidationPipe } from '../pipes/FileSizeValidationPipe';

@Module({
  imports: [FilesModule],
  controllers: [AvatarsController],
  providers: [AvatarsService, JwtAccessGuard, FileSizeValidationPipe],
})
export class AvatarsModule {}
