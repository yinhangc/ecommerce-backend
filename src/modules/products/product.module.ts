import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { AzureBlobService } from '../azure-blob/azure-blob.service';
import { ConfigModule } from '@nestjs/config';
import { AzureBlobModule } from '../azure-blob/azure-blob.module';
import { ProductCategoryController } from './product-category.controller';

@Module({
  imports: [ConfigModule, PrismaModule, AzureBlobModule],
  providers: [ProductService, AzureBlobService],
  controllers: [ProductController, ProductCategoryController],
  exports: [ProductService],
})
export class ProductModule {}
