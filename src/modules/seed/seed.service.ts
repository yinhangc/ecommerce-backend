import { Injectable } from '@nestjs/common';
import { ProductService } from 'src/modules/products/product.service';
import data from './seed-data.json';

@Injectable()
export class SeedService {
  constructor(private productService: ProductService) {
    console.log('data', data);
  }

  async seed() {
    await this.seedProduct();
  }

  async seedProduct() {
    console.log('START seeding products...');
  }
}
