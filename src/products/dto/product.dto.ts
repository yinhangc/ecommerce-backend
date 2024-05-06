import { ProductStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, ValidateNested } from 'class-validator';
import { ProductOptionDto } from './productOption.dto';
import { ProductVariantDto } from './productVariant.dto';

export class ProductDto {
  name: string;

  description: string;

  @IsEnum(ProductStatus)
  status: ProductStatus;

  @IsArray()
  imageUrls: string[];

  @ValidateNested({ each: true })
  @Type(() => ProductOptionDto)
  options: ProductOptionDto[];

  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants: ProductVariantDto[];
}
