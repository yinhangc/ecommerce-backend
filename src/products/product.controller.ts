import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProductDto } from './dto/product.dto';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post()
  async create(@Body() productDto: ProductDto): Promise<void> {
    return await this.productService.create(productDto);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.productService.getById(Number(id));
  }
}
