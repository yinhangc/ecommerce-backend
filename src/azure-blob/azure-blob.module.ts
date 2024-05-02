import { Module } from '@nestjs/common';
import { AzureBlobService } from './azure-blob.service';
import { AzureBlobController } from './azure-blob.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [AzureBlobService],
  controllers: [AzureBlobController],
})
export class AzureBlobModule {}
