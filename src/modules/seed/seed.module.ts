import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ProductModule } from '../products/product.module';
import { ProductService } from '../products/product.service';

@Module({
  providers: [SeedService, ProductService],
  imports: [ProductModule],
})
export class SeedModule {}
