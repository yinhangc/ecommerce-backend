import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ListDataDto } from 'src/shared/dto/list-data.dto';
import { ProductCategoryDto } from './dto/product-category.dto';
import { ProductCategoryService } from './product-category.service';
import { ListWithParent } from './types';

@Controller('categories')
export class ProductCategoryController {
  constructor(private productCategoryService: ProductCategoryService) {}

  @Post()
  async create(@Body() dto: ProductCategoryDto): Promise<ProductCategoryDto> {
    return await this.productCategoryService.create(dto);
  }

  @Post('/list')
  async list(
    @Body() query: ListDataDto,
  ): Promise<{ rows: ListWithParent; count: number }> {
    return await this.productCategoryService.list(query);
  }

  @Get('/all')
  async getAllForDropdown() {
    return await this.productCategoryService.getAllForDropdown();
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<ProductCategoryDto> {
    return await this.productCategoryService.getById(Number(id));
  }

  @Put(':id')
  async updateById(@Param('id') id: string, @Body() dto: ProductCategoryDto) {
    return await this.productCategoryService.update(Number(id), dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.productCategoryService.delete(Number(id));
  }
}
