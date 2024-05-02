import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AzureBlobService } from './azure-blob.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

@Controller('blobs')
export class AzureBlobController {
  constructor(private azureBlobService: AzureBlobService) {}

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<string[]> {
    return await this.azureBlobService.uploadFiles(files);
  }
}
