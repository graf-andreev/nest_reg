import { Injectable } from '@nestjs/common';

@Injectable()
export class AvatarsService {
  create() {
    return 'This action adds a new avatar';
  }

  remove(id: number) {
    return `This action removes a #${id} avatar`;
  }
}
