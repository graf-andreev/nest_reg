import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: Express.Multer.File) {
    if (!value) {
      throw new BadRequestException('Файл не найден');
    }

    if (value.size > MAX_SIZE_BYTES) {
      throw new BadRequestException(
        'Размер файла превышает допустимый лимит в 10 МБ',
      );
    }

    if (!value.mimetype || !ALLOWED_MIME_TYPES.includes(value.mimetype)) {
      throw new BadRequestException('Допустимы только jpeg и png');
    }

    return value;
  }
}
