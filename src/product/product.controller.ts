import { Body, Controller, Post } from '@nestjs/common';
import { ProductDto } from './dto/product.dto';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post('/')
  async createProduct(@Body() productDto: ProductDto): Promise<void> {
    console.log('createProduct', productDto);
  }
}
