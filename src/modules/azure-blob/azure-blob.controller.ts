import { Controller } from '@nestjs/common';
import { AzureBlobService } from './azure-blob.service';

@Controller('blobs')
export class AzureBlobController {
  constructor(private azureBlobService: AzureBlobService) {}
}
