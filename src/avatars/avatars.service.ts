import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IFileService } from '../providers/files.adapter';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AvatarsService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(IFileService) private readonly fileService: IFileService,
  ) {}

  async upload(userId: number, file: Express.Multer.File) {
    const active = await this.prismaService.avatar.count({
      where: { userId, deletedAt: null },
    });
    if (active >= 5) {
      throw new BadRequestException('Можно максимум 5 активных аватарок');
    }

    const ext = file.originalname.split('.').pop()?.toLowerCase();
    const fileName = `${userId}-${Date.now()}.${ext ?? 'jpg'}`;

    await this.fileService.uploadFile({
      file,
      folder: 'avatars',
      name: fileName,
    });

    return this.prismaService.avatar.create({
      data: {
        fileName,
        userId,
      },
    });
  }

  async delete(userId: number, id: number) {
    const avatar = await this.prismaService.avatar.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!avatar) {
      throw new NotFoundException('Аватар не найден');
    }
    return this.prismaService.avatar.update({
      where: { id: avatar.id },
      data: { deletedAt: new Date() },
    });
  }
}
