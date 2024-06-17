import { Type } from 'class-transformer';
import { IsOptional, Max, Min, ValidateNested } from 'class-validator';

class ProductVariantOptionDto {
  label: string;
  value: string;
}
export class ProductVariantDto {
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
