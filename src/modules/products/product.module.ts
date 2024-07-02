import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/modules/prisma/prisma.module';
import { AzureBlobModule } from '../azure-blob/azure-blob.module';
import { AzureBlobService } from '../azure-blob/azure-blob.service';
import { ProductCategoryController } from './product-category.controller';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductCategoryService } from './product-category.service';

@Module({
  imports: [ConfigModule, PrismaModule, AzureBlobModule],
  providers: [AzureBlobService, ProductCategoryService, ProductService],
  controllers: [ProductController, ProductCategoryController],
  exports: [ProductService],
})
export class ProductModule {}
