import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProductDto } from './dto/product.dto';
import { ProductService } from './product.service';
import { Prisma, Product } from '@prisma/client';

@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post()
  async create(@Body() productDto: ProductDto): Promise<string> {
    await this.productService.create(productDto);
    return 'SUCCESS';
  }

  @Post('/list')
  async list(
    @Body() options: Prisma.ProductFindManyArgs,
  ): Promise<{ rows: any; count: number }> {
    return await this.productService.list(options);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<ProductDto> {
    return await this.productService.getById(Number(id));
  }
}
