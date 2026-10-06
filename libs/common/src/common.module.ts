import { Global, Module } from '@nestjs/common';
import { FileSizeValidationPipe } from './pipes/file-size-validation.pipe';
import { LoggerModule } from './logger/logger.module';

@Global()
@Module({
  imports: [LoggerModule],
  providers: [FileSizeValidationPipe],
  exports: [LoggerModule, FileSizeValidationPipe],
})
export class CommonModule {}
