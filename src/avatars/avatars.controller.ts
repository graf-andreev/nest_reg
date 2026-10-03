import {
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import JwtAccessGuard from '../guards/jwt-access.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileSizeValidationPipe } from '../pipes/FileSizeValidationPipe';
import express from 'express';
import { AvatarsService } from './avatars.service';

@Controller('avatars')
export class AvatarsController {
  constructor(private readonly avatarsService: AvatarsService) {}

  @Post('upload')
  @UseGuards(JwtAccessGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @Req() request: express.Request,
    @UploadedFile(FileSizeValidationPipe) file: Express.Multer.File,
  ) {
    const userId = request['user'] as { sub: number };
    return this.avatarsService.upload(userId.sub, file);
  }

  @UseGuards(JwtAccessGuard)
  @Delete('delete/:id')
  remove(
    @Req() request: express.Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const user = request['user'] as { sub: number };
    return this.avatarsService.delete(user.sub, id);
  }
}
