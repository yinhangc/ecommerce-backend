import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { ListDataDto } from 'src/shared/dto/list-data.dto';
import { ProductDto } from './dto/product.dto';
import { ProductService } from './product.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ParseFormDataPipe } from 'src/shared/pipes/parse-form-data.pipe';
import { TListProductWithSkus } from './types';

@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async create(
    @Body(new ParseFormDataPipe(ProductDto), new ValidationPipe())
    dto: ProductDto,
    @UploadedFiles() images: Express.Multer.File[],
  ): Promise<ProductDto> {
    dto.images = images;
    return await this.productService.create(dto);
  }

  @Post('/list')
  async list(
    @Body() query: ListDataDto,
  ): Promise<{ rows: TListProductWithSkus; count: number }> {
    return await this.productService.list(query);
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<ProductDto> {
    return await this.productService.getById(Number(id));
  }

  @Put('/:id')
  @UseInterceptors(AnyFilesInterceptor())
  async updateById(
    @Param('id') id: string,
    @Body(new ParseFormDataPipe(ProductDto), new ValidationPipe())
    dto: ProductDto,
    @UploadedFiles() images: Express.Multer.File[],
  ): Promise<ProductDto> {
    dto.images = dto.images.filter((im) => typeof im === 'string');
    dto.images.push(...images);
    return await this.productService.updateById(Number(id), dto);
  }
}
