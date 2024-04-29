import { Injectable } from '@nestjs/common';

@Injectable()
export class ImageService {
  async upload(files: Express.Multer.File[]) {}
}
