import { ProductStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class ProductOptionValueDto {
  value: string;
}

class ProductOptionDto {
  label: string;

  @ValidateNested({ each: true })
  @Type(() => ProductOptionValueDto)
  values: ProductOptionValueDto[];
}

class ProductVariantOptionDto {
  label: string;
  value: string;
}

class ProductVariantDto {
  name: string;

  @Min(1)
  @Max(9999)
  price: number;

  @Min(0)
  @Max(9999)
  quantity: number;

  @ValidateNested({ each: true })
  @Type(() => ProductVariantOptionDto)
  options: ProductVariantOptionDto[];

  @IsOptional()
  sku: string;
}

export class ProductDto {
  id?: number;

  name: string;

  description: string;

  @IsEnum(ProductStatus)
  status: ProductStatus;

  @IsArray()
  images: (string | Express.Multer.File)[];

  @ValidateNested({ each: true })
  @Type(() => ProductOptionDto)
  options: ProductOptionDto[];

  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants: ProductVariantDto[];
}
