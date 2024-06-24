import { Injectable } from '@nestjs/common';
import { ProductCategoryDto } from './dto/product-category.dto';

@Injectable()
export class ProductCategoryService {
  constructor() {}

  async create(productCategoryDto: ProductCategoryDto) {}
}
