import { Type } from 'class-transformer';
import { IsArray, IsEnum, ValidateNested } from 'class-validator';
import { ProductVariantDto } from './productVariant.dto';
import { ProductOptionDto } from './productOption.dto';

export enum ProductStatus {
  ACTIVE,
  INACTIVE,
}

export class ProductDto {
  name: string;

  description: string;

  @IsEnum(ProductStatus)
  status: ProductStatus;

  @IsArray()
  images: string[];

  @ValidateNested({ each: true })
  @Type(() => ProductOptionDto)
  options: ProductOptionDto[];

  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants: ProductVariantDto[];
}
