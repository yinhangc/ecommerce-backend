import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ImageService } from './image.service';

@Controller('images')
export class ImageController {
  constructor(private imageService: ImageService) {}
  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    await this.imageService.upload(files);
  }
}
